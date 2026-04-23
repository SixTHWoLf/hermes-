package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const testSecret = "test-secret-key"

// generateTestToken 生成测试用 JWT token
func generateTestToken(userID, username, role string, secret string) string {
	claims := &JWTClaims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

// TestJWTAuth_MissingHeader 测试缺少 Authorization header
func TestJWTAuth_MissingHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(JWTAuth(testSecret))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

// TestJWTAuth_InvalidFormat 测试 Authorization header 格式错误
func TestJWTAuth_InvalidFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(JWTAuth(testSecret))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

// TestJWTAuth_InvalidToken 测试无效的 token
func TestJWTAuth_InvalidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(JWTAuth(testSecret))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

// TestJWTAuth_ValidToken 测试有效的 token
func TestJWTAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(JWTAuth(testSecret))
	r.GET("/test", func(c *gin.Context) {
		userID := GetUserIDFromContext(c)
		username := GetUsernameFromContext(c)
		role := GetRoleFromContext(c)

		c.JSON(http.StatusOK, gin.H{
			"user_id":  userID,
			"username": username,
			"role":     role,
		})
	})

	token := generateTestToken("user-123", "testuser", "admin", testSecret)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

// TestJWTAuth_WrongSecret 测试使用错误密钥签名的 token
func TestJWTAuth_WrongSecret(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	r.Use(JWTAuth(testSecret))
	r.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// 使用不同的密钥生成 token
	token := generateTestToken("user-123", "testuser", "admin", "wrong-secret")

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}

// TestGetUserIDFromContext 测试从上下文获取用户 ID
func TestGetUserIDFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	// 测试空上下文
	userID := GetUserIDFromContext(c)
	if userID != "" {
		t.Errorf("Expected empty string, got %s", userID)
	}

	// 测试设置值后获取
	c.Set("user_id", "test-user-id")
	userID = GetUserIDFromContext(c)
	if userID != "test-user-id" {
		t.Errorf("Expected 'test-user-id', got %s", userID)
	}
}

// TestGetUsernameFromContext 测试从上下文获取用户名
func TestGetUsernameFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	username := GetUsernameFromContext(c)
	if username != "" {
		t.Errorf("Expected empty string, got %s", username)
	}

	c.Set("username", "testuser")
	username = GetUsernameFromContext(c)
	if username != "testuser" {
		t.Errorf("Expected 'testuser', got %s", username)
	}
}

// TestGetRoleFromContext 测试从上下文获取角色
func TestGetRoleFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	role := GetRoleFromContext(c)
	if role != "" {
		t.Errorf("Expected empty string, got %s", role)
	}

	c.Set("role", "admin")
	role = GetRoleFromContext(c)
	if role != "admin" {
		t.Errorf("Expected 'admin', got %s", role)
	}
}