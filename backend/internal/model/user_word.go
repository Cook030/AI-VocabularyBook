package model

import (
	"time"

	"gorm.io/gorm"
)

type UserWord struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"uniqueIndex:idx_user_word;not null" json:"user_id"`
	WordID     uint           `gorm:"uniqueIndex:idx_user_word;not null" json:"word_id"`
	IsMastered bool           `gorm:"not null;default:false" json:"is_mastered"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	User       User           `gorm:"foreignKey:UserID" json:"-"`
	Word       Word           `gorm:"foreignKey:WordID" json:"word,omitempty"`
}
