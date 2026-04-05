package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"column:password_hash;not null"`
	CreatedAt time.Time `json:"created_at"`
}

type Job struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description" gorm:"type:text"`
	OwnerID     uint      `json:"owner_id"`
	Owner       User      `json:"-" gorm:"foreignKey:OwnerID"`
	CreatedAt   time.Time `json:"created_at"`
}

type Application struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_job"`
	JobID     uint      `json:"job_id" gorm:"not null;uniqueIndex:idx_user_job"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
	Job       Job       `json:"job,omitempty" gorm:"foreignKey:JobID"`
	CreatedAt time.Time `json:"created_at"`
}
