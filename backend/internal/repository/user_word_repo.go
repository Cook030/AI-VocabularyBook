package repository

import (
	"ai-vocabularybook/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserWordRepository struct {
	db *gorm.DB
}

func NewUserWordRepository(db *gorm.DB) *UserWordRepository {
	return &UserWordRepository{db: db}
}

func (r *UserWordRepository) Create(userID, wordID uint) error {
	userWord := model.UserWord{
		UserID:     userID,
		WordID:     wordID,
		IsMastered: false,
	}
	//如果没有unscoped()，GORM 默认会去查询deleted_at为null的记录
	//有了unscoped()，GORM 会去查询所有记录，少了一个查询条件deleted_at IS NULL
	//从而可以查到被软删除的记录，起到关掉软删除过滤的作用
	return r.db.Unscoped().Clauses(clause.OnConflict{
		//指定触发冲突的字段
		Columns: []clause.Column{{Name: "user_id"}, {Name: "word_id"}},
		//冲突时直接指定固定的更新值 ，而不是从插入数据中取值，与word里的AssignmentColumns()不同
		DoUpdates: clause.Assignments(map[string]interface{}{
			"deleted_at":  nil,
			"is_mastered": false,
		}),
	}).Create(&userWord).Error
}

func (r *UserWordRepository) ListByUserID(userID uint, page, pageSize int) ([]model.Word, int64, error) {
	var words []model.Word
	var total int64

	query := r.db.Table("user_words").Where("user_id = ? AND deleted_at IS NULL", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Table("user_words").
		Select("words.*, user_words.is_mastered").
		Joins("JOIN words ON user_words.word_id = words.id"). //关联查询表words
		Where("user_words.user_id = ? AND user_words.deleted_at IS NULL", userID).
		Order("user_words.created_at DESC"). //page页排序
		Offset((page - 1) * pageSize).       //第 1 页：跳过 0 条，取 10 条
		Limit(pageSize).                     //第 2 页：跳过 10 条，取 10 条
		Scan(&words).Error

	return words, total, err
}

func (r *UserWordRepository) UpdateStatus(userID, wordID uint, isMastered bool) error {
	return r.db.Model(&model.UserWord{}).
		Where("user_id = ? AND word_id = ?", userID, wordID).
		Update("is_mastered", isMastered).Error
}

func (r *UserWordRepository) Delete(userID, wordID uint) error {
	//当模型定义了 gorm.DeletedAt 字段时，
	//GORM 的 Delete() 方法会自动执行软删除。
	return r.db.Where("user_id = ? AND word_id = ?", userID, wordID).Delete(&model.UserWord{}).Error
}

func (r *UserWordRepository) Exists(userID, wordID uint) bool {
	var count int64
	r.db.Model(&model.UserWord{}).
		Where("user_id = ? AND word_id = ? AND deleted_at IS NULL", userID, wordID).
		Count(&count)
	return count > 0
}
