package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

// WordAIResponse 定义 AI 返回的 JSON 结构，需与 Prompt 对应
type WordAIResponse struct {
	Translation        string   `json:"translation"`
	ExampleSentence    string   `json:"example_sentence"`
	ExampleTranslation string   `json:"example_translation"`
	Synonyms           []string `json:"synonyms"`
}

// GetWordDetails 调用阿里云 API 获取单词详细信息
func GetWordDetails(word string, modelName string) (*WordAIResponse, error) {
	apiKey := os.Getenv("AI_API_KEY")
	apiUrl := "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
	// 核心 Prompt 设计：强制要求 JSON
	prompt := fmt.Sprintf(`请分析英文单词 "%s"。
要求：提供按词性分类的中文释义、一个地道的英文例句及其中文翻译、以及3个同义词。
释义必须按词性分类，格式为：词性缩写（如adj. n. v.）+ 空格 + 该词性下的所有中文意思，多个意思用顿号分隔。
必须严格按下述 JSON 格式返回，不要包含任何其他文字描述：
{
  "translation": "adj. 固执的、顽强的；n. 坚持、持续",
  "example_sentence": "English example sentence.",
  "example_translation": "例句的中文翻译",
  "synonyms": ["synonym1", "synonym2", "synonym3"]
}`, word)

	if modelName == "" {
		modelName = "qwen-plus"
	}

	// 构造请求体，使用 DashScope 兼容 OpenAI 模式格式
	requestBody, _ := json.Marshal(map[string]interface{}{
		"model": modelName,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	})

	req, _ := http.NewRequest("POST", apiUrl, bytes.NewBuffer(requestBody))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("阿里云 API 请求失败，状态码: %d，响应: %s", resp.StatusCode, string(body))
	}

	// 解析 API 响应
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	if len(result.Choices) == 0 {
		return nil, fmt.Errorf("阿里云 API 响应中没有 choices，响应: %s", string(body))
	}

	// 拿到 AI 返回的 Content 字符串（JSON 文本）
	content := normalizeJSONContent(result.Choices[0].Message.Content)

	// 将 Content 字符串再次解析为 WordAIResponse 结构体
	var aiRes WordAIResponse
	if err := json.Unmarshal([]byte(content), &aiRes); err != nil {
		return nil, fmt.Errorf("AI 返回格式解析失败: %v，原始内容: %s", err, content)
	}

	return &aiRes, nil
}

func normalizeJSONContent(content string) string {
	content = strings.TrimSpace(content)
	content = strings.TrimPrefix(content, "```json")
	content = strings.TrimPrefix(content, "```")
	content = strings.TrimSuffix(content, "```")
	content = strings.TrimSpace(content)

	start := strings.Index(content, "{")
	end := strings.LastIndex(content, "}")
	if start >= 0 && end > start {
		return strings.TrimSpace(content[start : end+1])
	}

	return content
}
