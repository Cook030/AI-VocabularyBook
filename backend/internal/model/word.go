package model

import (
	"time"

	"gorm.io/gorm"
)

type Word struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Word               string         `gorm:"uniqueIndex;type:varchar(100);not null" json:"word"`
	Translation        string         `gorm:"type:varchar(255)" json:"translation"`
	ExampleSentence    string         `gorm:"type:text" json:"example_sentence"`
	ExampleTranslation string         `gorm:"type:text" json:"example_translation"`
	Synonyms           string         `gorm:"type:json" json:"synonyms"`
	IsMastered         bool           `gorm:"-" json:"is_mastered,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}
