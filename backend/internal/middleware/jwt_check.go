package middleware

import (
	"ai-vocabularybook/utils/jwt"
	"ai-vocabularybook/utils/response"
	"strings"

	"github.com/gin-gonic/gin"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取 Header 中的 Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.FailWithCode(401, "未登录或非法访问", c)
			c.Abort() // 终止后续调用
			return
		}

		// 2. 按空格分割，通常格式为: Bearer <token>
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.FailWithCode(401, "认证格式错误", c)
			c.Abort()
			return
		}

		// 3. 解析并校验 Token
		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			response.FailWithCode(401, "Token 无效或已过期", c)
			c.Abort()
			return
		}

		// 4. 将解析出来的用户信息存入 Context，方便后续 Handler 获取当前用户 ID
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)

		c.Next() // 继续执行后续逻辑
	}
}
