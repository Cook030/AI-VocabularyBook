package repository

import (
	"ai-vocabularybook/internal/model"

	"gorm.io/gorm"
)

type UserRepository struct {
	//db是一个指向gorm.DB的指针
	db *gorm.DB
}

// 构造函数，创建UserRepository实例
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// r是Receiver
func (r *UserRepository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) ExistsByUsername(username string) (bool, error) {
	var count int64
	if err := r.db.Model(&model.User{}).Where("username = ?", username).Count(&count).Error; err != nil {
		return false, err
	}
	//count>0，说明用户名存在
	return count > 0, nil
}
