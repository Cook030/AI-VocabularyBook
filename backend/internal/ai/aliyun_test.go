package ai

import (
	"fmt"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestGetWordDetails(t *testing.T) {
	assertEnvLoaded(t)
	runGetWordDetailsTest(t, "apple", "qwen-plus")
}

func TestGetWordDetailsWithDeepSeek(t *testing.T) {
	assertEnvLoaded(t)
	runGetWordDetailsTest(t, "banana", "deepseek-v3")
}

func assertEnvLoaded(t *testing.T) {
	t.Helper()

	err := godotenv.Load("../../.env")
	if err != nil {
		t.Log("未找到 .env 文件，将尝试从系统环境变量读取")
	}

	apiKey := os.Getenv("AI_API_KEY")
	if apiKey == "" {
		t.Fatal("错误: AI_API_KEY 环境变量未设置")
	}
}

func runGetWordDetailsTest(t *testing.T, testWord string, modelName string) {
	t.Helper()

	t.Logf("正在使用模型 %s 请求 AI 分析单词: %s ...", modelName, testWord)

	res, err := GetWordDetails(testWord, modelName)
	if err != nil {
		t.Fatalf("请求失败: %v", err)
	}

	fmt.Println("\n--- AI 返回结果 ---")
	fmt.Printf("模型: %s\n", modelName)
	fmt.Printf("单词: %s\n", testWord)
	fmt.Printf("翻译: %s\n", res.Translation)
	fmt.Printf("例句: %s\n", res.ExampleSentence)
	fmt.Printf("例句翻译: %s\n", res.ExampleTranslation)
	fmt.Printf("同义词: %v\n", res.Synonyms)
	fmt.Println("------------------")

	if res.Translation == "" {
		t.Error("解析失败: 翻译内容为空")
	}
	if len(res.Synonyms) == 0 {
		t.Error("解析失败: 同义词列表为空")
	}
}
