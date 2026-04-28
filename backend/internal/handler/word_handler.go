package handler

import (
	"ai-vocabularybook/internal/service"
	"ai-vocabularybook/utils/response"

	"github.com/gin-gonic/gin"
)

type WordHandler struct {
	wordService *service.WordService
}

func NewWordHandler(wordService *service.WordService) *WordHandler {
	return &WordHandler{wordService: wordService}
}

func (h *WordHandler) Search(c *gin.Context) {
	userID, ok := getCurrentUserID(c)
	if !ok {
		response.FailWithCode(401, "未登录或非法访问", c)
		return
	}

	word := c.Query("word")
	modelName := c.DefaultQuery("model", "qwen-plus")

	result, err := h.wordService.Search(userID, word, modelName)
	if err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(result, "查询成功", c)
}
