package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/test-prog/recruitment/internal/auth"
)

const CtxUserID = "userID"

func JWT(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if h == "" || !strings.HasPrefix(strings.ToLower(h), "bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "não autorizado"})
			return
		}
		raw := strings.TrimSpace(h[7:])
		claims, err := auth.ParseToken(raw, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token inválido"})
			return
		}
		c.Set(CtxUserID, claims.UserID)
		c.Next()
	}
}

func UserID(c *gin.Context) (uint, bool) {
	v, ok := c.Get(CtxUserID)
	if !ok {
		return 0, false
	}
	id, ok := v.(uint)
	return id, ok
}
