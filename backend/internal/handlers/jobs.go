package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/test-prog/recruitment/internal/middleware"
	"github.com/test-prog/recruitment/internal/models"
	"gorm.io/gorm"
)

type JobsHandler struct {
	DB *gorm.DB
}

type createJobBody struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

func (h *JobsHandler) List(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	var jobs []models.Job
	tx := h.DB.Model(&models.Job{}).Order("created_at desc")
	if q != "" {
		pattern := "%" + strings.ToLower(q) + "%"
		tx = tx.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", pattern, pattern)
	}
	if err := tx.Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao buscar vagas"})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *JobsHandler) Create(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
		return
	}
	var body createJobBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "título é obrigatório"})
		return
	}
	title := strings.TrimSpace(body.Title)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "título inválido"})
		return
	}
	j := models.Job{
		Title:       title,
		Description: strings.TrimSpace(body.Description),
		OwnerID:     uid,
	}
	if err := h.DB.Create(&j).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao criar vaga"})
		return
	}
	c.JSON(http.StatusCreated, j)
}

func (h *JobsHandler) Mine(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
		return
	}
	var jobs []models.Job
	if err := h.DB.Where("owner_id = ?", uid).Order("created_at desc").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao listar suas vagas"})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *JobsHandler) Apply(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
		return
	}
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}
	jobID := uint(id64)
	var job models.Job
	if err := h.DB.First(&job, jobID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vaga não encontrada"})
		return
	}
	if job.OwnerID == uid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "não é possível candidatar-se à própria vaga"})
		return
	}
	app := models.Application{UserID: uid, JobID: jobID}
	if err := h.DB.Create(&app).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "você já se candidatou a esta vaga"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "candidatura registrada", "id": app.ID})
}

func (h *JobsHandler) MyApplications(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
		return
	}
	var apps []models.Application
	if err := h.DB.Preload("Job").Where("user_id = ?", uid).Order("created_at desc").Find(&apps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao listar candidaturas"})
		return
	}
	c.JSON(http.StatusOK, apps)
}

func (h *JobsHandler) Me(c *gin.Context) {
	uid, ok := middleware.UserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
		return
	}
	var u models.User
	if err := h.DB.First(&u, uid).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": u.ID, "email": u.Email})
}
