package router

import (
	"ai-vocabularybook/internal/handler"
	"ai-vocabularybook/internal/middleware"
	"ai-vocabularybook/internal/repository"
	"ai-vocabularybook/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.Logger())

	userRepo := repository.NewUserRepository(db)
	wordRepo := repository.NewWordRepository(db)
	userWordRepo := repository.NewUserWordRepository(db)
	authService := service.NewAuthService(userRepo)
	wordService := service.NewWordService(wordRepo, userWordRepo)
	userWordService := service.NewUserWordService(wordRepo, userWordRepo)
	authHandler := handler.NewAuthHandler(authService)
	wordHandler := handler.NewWordHandler(wordService)
	userWordHandler := handler.NewUserWordHandler(userWordService)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		words := api.Group("/words", middleware.JWTAuth())
		{
			words.GET("/search", wordHandler.Search)
		}

		userWords := api.Group("/user-words", middleware.JWTAuth())
		{
			userWords.GET("", userWordHandler.List)
			userWords.POST("", userWordHandler.Add)
			userWords.PATCH("/:wordID/status", userWordHandler.UpdateStatus) //只更新单词的状态
			userWords.DELETE("/:wordID", userWordHandler.Remove)
		}
	}

	return r
}
