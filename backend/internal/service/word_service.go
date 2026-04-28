package service

import (
	"encoding/json"
	"errors"
	"strings"

	"ai-vocabularybook/internal/ai"
	"ai-vocabularybook/internal/model"
	"ai-vocabularybook/internal/repository"
)

type WordService struct {
	wordRepo     *repository.WordRepository
	userWordRepo *repository.UserWordRepository
}

func NewWordService(wordRepo *repository.WordRepository, userWordRepo *repository.UserWordRepository) *WordService {
	return &WordService{
		wordRepo:     wordRepo,
		userWordRepo: userWordRepo,
	}
}

type SearchResult struct {
	Word    *model.Word `json:"word"`
	IsSaved bool        `json:"is_saved"`
}

func (s *WordService) Search(userID uint, wordText, modelName string) (*SearchResult, error) {
	wordText = strings.TrimSpace(strings.ToLower(wordText))
	if wordText == "" {
		return nil, errors.New("单词不能为空")
	}

	isSaved := false
	var word *model.Word

	existingWord, err := s.wordRepo.GetByWord(wordText)
	if err == nil {
		word = existingWord
		isSaved = s.userWordRepo.Exists(userID, word.ID)
	}

	if word == nil {
		aiRes, err := ai.GetWordDetails(wordText, modelName)
		if err != nil {
			return nil, err
		}

		synonyms, _ := json.Marshal(aiRes.Synonyms)
		word = &model.Word{
			Word:               wordText,
			Translation:        aiRes.Translation,
			ExampleSentence:    aiRes.ExampleSentence,
			ExampleTranslation: aiRes.ExampleTranslation,
			Synonyms:           string(synonyms),
		}
	}

	return &SearchResult{
		Word:    word,
		IsSaved: isSaved,
	}, nil
}

func (s *WordService) GetByWord(wordText string) (*model.Word, error) {
	return s.wordRepo.GetByWord(wordText)
}

func (s *WordService) Create(word *model.Word) error {
	return s.wordRepo.Create(word)
}
