package service

import (
	"errors"
	"fmt"
	"strings"

	"ai-vocabularybook/internal/model"
	"ai-vocabularybook/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("用户名或密码错误")
	ErrUserExists         = errors.New("用户名已存在")
)

// auth偏用户认证操作，user偏用户数据操作
type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(username, password string) error {
	username = strings.TrimSpace(username)
	if username == "" || password == "" {
		return errors.New("用户名和密码不能为空")
	}

	exists, err := s.userRepo.ExistsByUsername(username)
	if err != nil {
		return err
	}
	if exists {
		return ErrUserExists
	}

	//第二个参数是加密强度
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.userRepo.CreateUser(&model.User{
		Username: username,
		Password: string(hashedPassword),
	})
}

func (s *AuthService) Login(username, password string) (*model.User, error) {
	username = strings.TrimSpace(username)
	if username == "" || password == "" {
		return nil, ErrInvalidCredentials
	}

	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// 调试日志：打印密码哈希和比较结果
	fmt.Printf("Debug: Comparing password for user %s\n", username)
	fmt.Printf("Debug: Stored hash: %s\n", user.Password)
	fmt.Printf("Debug: Input password: %s\n", password)

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		fmt.Printf("Debug: Password comparison failed: %v\n", err)
		return nil, ErrInvalidCredentials
	}

	fmt.Printf("Debug: Password comparison successful\n")
	return user, nil
}
