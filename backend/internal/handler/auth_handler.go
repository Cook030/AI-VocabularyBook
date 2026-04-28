package handler

import (
	"ai-vocabularybook/internal/service"
	"ai-vocabularybook/utils/jwt"
	"ai-vocabularybook/utils/response"

	"github.com/gin-gonic/gin"
)

type AuthRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail("参数错误", c)
		return
	}

	if err := h.authService.Register(req.Username, req.Password); err != nil {
		response.Fail(err.Error(), c)
		return
	}

	response.Success(nil, "注册成功", c)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail("参数错误", c)
		return
	}

	user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		response.Fail("用户名或密码错误", c)
		return
	}

	token, err := jwt.GenerateToken(user.ID, user.Username)
	if err != nil {
		response.Fail("Token 生成失败", c)
		return
	}

	response.Success(gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
		},
	}, "登录成功", c)
}
