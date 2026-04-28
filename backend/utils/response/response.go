package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 基础返回结构
type Response struct {
	Code int         `json:"code"` // 自定义业务状态码
	Data interface{} `json:"data"` // 数据内容
	Msg  string      `json:"msg"`  // 消息提示
}

const (
	SuccessCode = 200
	ErrorCode   = 400
)

// Result 统一调用接口
func Result(code int, data interface{}, msg string, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code: code,
		Data: data,
		Msg:  msg,
	})
}

// Success 成功返回的快捷方法
func Success(data interface{}, msg string, c *gin.Context) {
	Result(SuccessCode, data, msg, c)
}

// Fail 失败返回的快捷方法
func Fail(msg string, c *gin.Context) {
	Result(ErrorCode, nil, msg, c)
}

// FailWithCode 携带自定义错误码的失败返回
func FailWithCode(code int, msg string, c *gin.Context) {
	Result(code, nil, msg, c)
}
