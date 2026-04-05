package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/test-prog/recruitment/internal/auth"
	"github.com/test-prog/recruitment/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret string
	JWTTTL    time.Duration
}

type credsBody struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var body credsBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email e senha são obrigatórios"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(body.Email))
	if email == "" || len(body.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email inválido ou senha com menos de 6 caracteres"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao criar usuário"})
		return
	}
	u := models.User{Email: email, Password: string(hash)}
	if err := h.DB.Create(&u).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email já cadastrado"})
		return
	}
	token, err := auth.SignToken(u.ID, h.JWTSecret, h.jwtTTL())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao emitir token"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  gin.H{"id": u.ID, "email": u.Email},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var body credsBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email e senha são obrigatórios"})
		return
	}
	email := strings.TrimSpace(strings.ToLower(body.Email))
	var u models.User
	if err := h.DB.Where("email = ?", email).First(&u).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email ou senha incorretos"})
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(body.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email ou senha incorretos"})
		return
	}
	token, err := auth.SignToken(u.ID, h.JWTSecret, h.jwtTTL())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erro ao emitir token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  gin.H{"id": u.ID, "email": u.Email},
	})
}

func (h *AuthHandler) jwtTTL() time.Duration {
	if h.JWTTTL <= 0 {
		return 72 * time.Hour
	}
	return h.JWTTTL
}
