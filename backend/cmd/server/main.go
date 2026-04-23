package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	// 初始化配置
	initConfig()

	// 设置 Gin 运行模式
	gin.SetMode(viper.GetString("server.mode"))

	// 创建 Gin 路由实例
	r := gin.Default()

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

	// API 路由组
	api := r.Group("/api/v1")
	{
		// 示例路由
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})
	}
}