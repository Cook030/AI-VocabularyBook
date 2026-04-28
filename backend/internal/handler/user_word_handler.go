package handler

import (
	"strconv"

	"ai-vocabularybook/internal/service"
	"ai-vocabularybook/utils/response"

	"github.com/gin-gonic/gin"
)

type UserWordHandler struct {
	userWordService *service.UserWordService
}

func NewUserWordHandler(userWordService *service.UserWordService) *UserWordHandler {
	return &UserWordHandler{userWordService: userWordService}
}

type updateUserWordStatusRequest struct {
	IsMastered bool `json:"is_mastered"`
}

func (h *UserWordHandler) Add(c *gin.Context) {
	userID, ok := getCurrentUserID(c)
	if !ok {
		response.FailWithCode(401, "未登录或非法访问", c)
		return
	}

	var req service.AddWordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail("参数错误", c)
		return
	}

	wordID, err := h.userWordService.Add(userID, &req)
	if err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(gin.H{"word_id": wordID}, "加入生词本成功", c)
}

func (h *UserWordHandler) List(c *gin.Context) {
	userID, ok := getCurrentUserID(c)
	if !ok {
		response.FailWithCode(401, "未登录或非法访问", c)
		return
	}

	page := parsePositiveQuery(c, "page", 1)
	pageSize := parsePositiveQuery(c, "page_size", 10)

	words, total, err := h.userWordService.List(userID, page, pageSize)
	if err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(gin.H{
		"list":      words,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	}, "查询成功", c)
}

func (h *UserWordHandler) UpdateStatus(c *gin.Context) {
	userID, ok := getCurrentUserID(c)
	if !ok {
		response.FailWithCode(401, "未登录或非法访问", c)
		return
	}

	wordID, err := parseUintParam(c, "wordID")
	if err != nil {
		response.Fail("单词 ID 无效", c)
		return
	}

	var req updateUserWordStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail("参数错误", c)
		return
	}

	if err := h.userWordService.UpdateStatus(userID, wordID, req.IsMastered); err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(nil, "更新成功", c)
}

func (h *UserWordHandler) Remove(c *gin.Context) {
	userID, ok := getCurrentUserID(c)
	if !ok {
		response.FailWithCode(401, "未登录或非法访问", c)
		return
	}

	wordID, err := parseUintParam(c, "wordID")
	if err != nil {
		response.Fail("单词 ID 无效", c)
		return
	}

	if err := h.userWordService.Remove(userID, wordID); err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(nil, "移出生词本成功", c)
}

func getCurrentUserID(c *gin.Context) (uint, bool) {
	//尝试从上下文获取userID的值
	value, exists := c.Get("userID")
	if !exists {
		return 0, false
	}

	//value是空接口，使用类型断言获取uint类型
	userID, ok := value.(uint)
	if !ok {
		return 0, false
	}

	return userID, true
}

func parseUintParam(c *gin.Context, name string) (uint, error) {
	//获得路由参数的值，10进制解析，64位整数
	value, err := strconv.ParseUint(c.Param(name), 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(value), nil
}

func parsePositiveQuery(c *gin.Context, pagetype string, defaultValue int) int {
	value, err := strconv.Atoi(c.DefaultQuery(pagetype, strconv.Itoa(defaultValue)))
	if err != nil || value <= 0 {
		return defaultValue
	}
	return value
}
