package jwt

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type MyClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username string) (string, error) {
	//Token有效期24小时
	expirationTime := time.Now().Add(24 * time.Hour)

	//声明（核心数据）
	claims := &MyClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime), //过期时间
			IssuedAt:  jwt.NewNumericDate(time.Now()),     //签发时间
			Issuer:    "ai-vocabularybook",                //签发者
		},
	}

	//Token组成：Header、Payload、Signature
	//第一个传签名算法，第二个传声明（核心数据），返回一个结构体里面包含签名和声明
	//给出JWT的Header和Payload
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	//getSecret()生成密钥
	//通过密钥生成Signature，返回JWT字符串
	return token.SignedString(getSecret())
}

// 输出 ：解析出的 Claims 数据 或 错误
func ParseToken(tokenString string) (*MyClaims, error) {
	//三个参数：客户端发的Token、要解析到的Claims结构体、回调函数（返回密钥和错误）
	token, err := jwt.ParseWithClaims(tokenString, &MyClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*MyClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// 优先从环境变量中获取JWT的密钥
func getSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}
	return []byte(secret)
}
