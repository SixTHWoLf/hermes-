package main

import (
	"log"

	"github.com/SixTHWoLf/hermes-/backend/internal/api"
	"github.com/SixTHWoLf/hermes-/backend/internal/middleware"
	"github.com/SixTHWoLf/hermes-/backend/internal/websocket"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

var (
	wsHub        *websocket.Hub
	pushService  *api.PushService
	jwtSecret    string
)

func main() {
	// 初始化配置
	initConfig()

	// 设置 Gin 运行模式
	gin.SetMode(viper.GetString("server.mode"))

	// 创建 Gin 路由实例
	r := gin.Default()

	// 初始化 WebSocket Hub
	wsHub = websocket.NewHub()
	pushService = api.NewPushService(wsHub)

	// 启动 Hub
	go wsHub.Run()

	// 获取 JWT secret
	jwtSecret = viper.GetString("jwt.secret")
	if jwtSecret == "" {
		jwtSecret = "default-secret-change-in-production"
		log.Println("警告: 使用默认 JWT secret，请修改配置文件")
	}

	// 注册路由
	registerRoutes(r)

	// 启动服务器
	addr := viper.GetString("server.host") + ":" + viper.GetString("server.port")
	log.Printf("服务器启动于 %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}

// initConfig 初始化 Viper 配置
func initConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("../config")
	viper.AddConfigPath("config")
	viper.AddConfigPath("../../config")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// 配置文件不存在，使用默认配置
			viper.SetDefault("server.mode", "debug")
			viper.SetDefault("server.host", "0.0.0.0")
			viper.SetDefault("server.port", "8080")
			viper.SetDefault("jwt.secret", "default-secret-change-in-production")
			log.Println("未找到配置文件，使用默认配置")
		} else {
			log.Fatalf("读取配置文件失败: %v", err)
		}
	}
}

// registerRoutes 注册路由
func registerRoutes(r *gin.Engine) {
	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// WebSocket 路由
	wsHandler := websocket.NewHandler(wsHub, jwtSecret, nil)
	r.GET("/ws", wsHandler.HandleWebSocket)
	r.GET("/ws/stats", wsHandler.HandleStats)

	// API 路由组
	api := r.Group("/api/v1")
	{
		// 示例路由
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})

		// 需要认证的路由示例
		authenticated := api.Group("")
		authenticated.Use(middleware.JWTAuth(jwtSecret))
		{
			// WebSocket 连接（通过 token 认证）
			authenticated.GET("/ws/connect", wsHandler.HandleWebSocket)
		}

		// 推送通知 API（内部服务调用）
		push := api.Group("/push")
		{
			// 配置变更通知
			push.POST("/config-change", handleConfigChange)

			// 备份进度通知
			push.POST("/backup-progress", handleBackupProgress)

			// 恢复进度通知
			push.POST("/restore-progress", handleRestoreProgress)

			// 消息平台状态通知
			push.POST("/message-platform-status", handleMessagePlatformStatus)
		}
	}
}