package config

import (
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DSN    string
	AI_Key string
}

func Load() *Config {
	_ = godotenv.Load(
		".env",
		"../.env",
		//"../../.env",
		//"../../../.env",
	)

	return &Config{
		DSN:    normalizeMySQLDSN(os.Getenv("DATABASE_URL")),
		AI_Key: os.Getenv("AI_API_KEY"),
	}
}

func normalizeMySQLDSN(dsn string) string {
	if dsn == "" || strings.Contains(strings.ToLower(dsn), "parsetime=") {
		return dsn
	}

	separator := "?"
	if strings.Contains(dsn, "?") {
		separator = "&"
	}

	return dsn + separator + "parseTime=" + url.QueryEscape("True")
}
