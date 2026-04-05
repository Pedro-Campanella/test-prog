package database

import (
	"log"

	"github.com/test-prog/recruitment/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Job{}, &models.Application{}); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	return db
}
