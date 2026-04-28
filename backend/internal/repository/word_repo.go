package repository

import (
	"ai-vocabularybook/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type WordRepository struct {
	db *gorm.DB
}

func NewWordRepository(db *gorm.DB) *WordRepository {
	return &WordRepository{db: db}
}

func (r *WordRepository) Create(word *model.Word) error {
	return r.db.Create(word).Error
}

func (r *WordRepository) GetByID(id uint) (*model.Word, error) {
	var word model.Word
	if err := r.db.First(&word, id).Error; err != nil {
		return nil, err
	}
	return &word, nil
}

func (r *WordRepository) GetByWord(word string) (*model.Word, error) {
	var wordModel model.Word
	if err := r.db.Where("word = ?", word).First(&wordModel).Error; err != nil {
		return nil, err
	}
	return &wordModel, nil
}

func (r *WordRepository) GetOrCreate(word *model.Word) error {
	//r.db.Clauses() 传 clause.OnConflict{}处理插入冲突
	db := r.db.Clauses(clause.OnConflict{
		//指定哪几个字段触发冲突
		Columns: []clause.Column{{Name: "word"}},
		//指定冲突时需要更新哪些字段
		//传入的参数采用复合字面量初始化方法 写法：Type{ ElementList }
		DoUpdates: clause.AssignmentColumns([]string{"translation", "example_sentence", "example_translation", "synonyms", "updated_at"}),
	})
	db = db.Create(word)
	return db.Error
}
