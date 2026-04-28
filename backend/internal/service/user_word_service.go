package service

import (
	"encoding/json"
	"errors"

	"ai-vocabularybook/internal/model"
	"ai-vocabularybook/internal/repository"
)

type UserWordService struct {
	wordRepo     *repository.WordRepository
	userWordRepo *repository.UserWordRepository
}

func NewUserWordService(wordRepo *repository.WordRepository, userWordRepo *repository.UserWordRepository) *UserWordService {
	return &UserWordService{
		wordRepo:     wordRepo,
		userWordRepo: userWordRepo,
	}
}

type AddWordRequest struct {
	Word               string   `json:"word"`
	Translation        string   `json:"translation"`
	ExampleSentence    string   `json:"example_sentence"`
	ExampleTranslation string   `json:"example_translation"`
	Synonyms           []string `json:"synonyms"`
}

func (s *UserWordService) Add(userID uint, req *AddWordRequest) (uint, error) {
	if userID == 0 {
		return 0, errors.New("用户无效")
	}
	if req.Word == "" {
		return 0, errors.New("单词不能为空")
	}

	synonyms, _ := json.Marshal(req.Synonyms)
	word := &model.Word{
		Word:               req.Word,
		Translation:        req.Translation,
		ExampleSentence:    req.ExampleSentence,
		ExampleTranslation: req.ExampleTranslation,
		Synonyms:           string(synonyms),
	}

	if err := s.wordRepo.GetOrCreate(word); err != nil {
		return 0, errors.New("单词保存失败")
	}

	//调用GetOrCreate方法后，执行里面的create操作
	//GORM 会自动拿到数据库生成的自增 ID，赋值给 word.ID
	if err := s.userWordRepo.Create(userID, word.ID); err != nil {
		return 0, err
	}

	return word.ID, nil
}

func (s *UserWordService) List(userID uint, page, pageSize int) ([]model.Word, int64, error) {
	if userID == 0 {
		return nil, 0, errors.New("用户无效")
	}
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	return s.userWordRepo.ListByUserID(userID, page, pageSize)
}

func (s *UserWordService) UpdateStatus(userID, wordID uint, isMastered bool) error {
	if userID == 0 || wordID == 0 {
		return errors.New("用户或单词无效")
	}

	return s.userWordRepo.UpdateStatus(userID, wordID, isMastered)
}

func (s *UserWordService) Remove(userID, wordID uint) error {
	if userID == 0 || wordID == 0 {
		return errors.New("用户或单词无效")
	}

	return s.userWordRepo.Delete(userID, wordID)
}
