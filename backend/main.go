package main

import (
	"log"

	"ai-vocabularybook/internal/config"
	"ai-vocabularybook/internal/router"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()
	if cfg.DSN == "" {
		log.Fatal("DSN 环境变量未设置")
	}

	db, err := gorm.Open(mysql.Open(cfg.DSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	r := router.Setup(db)
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
