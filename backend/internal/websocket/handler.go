package websocket

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// 生产环境应该更严格地验证 origin
		return true
	},
}

// JWTClaims JWT Claims 结构（与 middleware 中的定义一致）
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// Handler WebSocket 处理器
type Handler struct {
	hub           *Hub
	jwtSecret     string
	allowedRoles  []string
}

// NewHandler 创建 WebSocket 处理器
func NewHandler(hub *Hub, jwtSecret string, allowedRoles []string) *Handler {
	return &Handler{
		hub:          hub,
		jwtSecret:    jwtSecret,
		allowedRoles: allowedRoles,
	}
}

// HandleWebSocket 处理 WebSocket 连接
func (h *Handler) HandleWebSocket(c *gin.Context) {
	// 从 query 参数获取 token
	tokenString := c.Query("token")
	if tokenString == "" {
		// 尝试从 header 获取
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				tokenString = parts[1]
			}
		}
	}

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Token is required",
		})
		return
	}

	// 验证 JWT token
	userID, err := h.validateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token: " + err.Error(),
		})
		return
	}

	// 升级 HTTP 连接为 WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket 升级失败: %v", err)
		return
	}

	// 创建客户端
	client := h.hub.NewClient(conn, userID)

	// 注册客户端
	h.hub.register <- client

	// 启动读写 goroutine
	go client.WritePump()
	go client.ReadPump()
}

// validateToken 验证 JWT token 并返回用户 ID
func (h *Handler) validateToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(h.jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return "", jwt.ErrSignatureInvalid
	}

	// 验证角色权限
	if len(h.allowedRoles) > 0 {
		roleValid := false
		for _, role := range h.allowedRoles {
			if claims.Role == role {
				roleValid = true
				break
			}
		}
		if !roleValid {
			return "", jwt.ErrSignatureInvalid
		}
	}

	return claims.UserID, nil
}

// HandleStats 处理统计信息请求
func (h *Handler) HandleStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"client_count": h.hub.GetClientCount(),
		"user_count":  h.hub.GetUserCount(),
	})
}