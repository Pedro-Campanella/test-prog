package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/test-prog/recruitment/internal/database"
	"github.com/test-prog/recruitment/internal/handlers"
	"github.com/test-prog/recruitment/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://recruit:recruit@localhost:5432/recruitment?sslmode=disable"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me"
		log.Println("warning: JWT_SECRET not set, using default (unsafe for production)")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db := database.Connect(dsn)

	authH := &handlers.AuthHandler{DB: db, JWTSecret: jwtSecret, JWTTTL: 72 * time.Hour}
	jobsH := &handlers.JobsHandler{DB: db}

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		if c.Writer.Header().Get("Access-Control-Allow-Origin") == "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.POST("/register", authH.Register)
		api.POST("/login", authH.Login)
		api.GET("/jobs", jobsH.List)
		authz := api.Group("")
		authz.Use(middleware.JWT(jwtSecret))
		{
			authz.GET("/me", jobsH.Me)
			authz.POST("/jobs", jobsH.Create)
			authz.GET("/jobs/mine", jobsH.Mine)
			authz.POST("/jobs/:id/apply", jobsH.Apply)
			authz.GET("/applications/mine", jobsH.MyApplications)
		}
	}

	log.Printf("listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
