package main

import (
	"net/http"

	"github.com/SixTHWoLf/hermes-/backend/internal/api"
	"github.com/SixTHWoLf/hermes-/backend/internal/websocket"
	"github.com/gin-gonic/gin"
)

// handleConfigChange 处理配置变更通知
func handleConfigChange(c *gin.Context) {
	var req struct {
		ConfigID   string `json:"config_id" binding:"required"`
		ConfigType string `json:"config_type" binding:"required"`
		Action     string `json:"action" binding:"required"` // created, updated, deleted
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	pushService.NotifyConfigChange(req.ConfigID, req.ConfigType, req.Action)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Config change notification sent",
	})
}

// handleBackupProgress 处理备份进度通知
func handleBackupProgress(c *gin.Context) {
	var req struct {
		UserID   string  `json:"user_id" binding:"required"`
		TaskID   string  `json:"task_id" binding:"required"`
		Status   string  `json:"status" binding:"required"` // running, completed, failed
		Progress float64 `json:"progress" binding:"required"`
		Message  string  `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	pushService.NotifyBackupProgress(req.UserID, req.TaskID, req.Status, req.Message, req.Progress)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Backup progress notification sent",
	})
}

// handleRestoreProgress 处理恢复进度通知
func handleRestoreProgress(c *gin.Context) {
	var req struct {
		UserID   string  `json:"user_id" binding:"required"`
		TaskID   string  `json:"task_id" binding:"required"`
		Status   string  `json:"status" binding:"required"` // running, completed, failed
		Progress float64 `json:"progress" binding:"required"`
		Message  string  `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	pushService.NotifyRestoreProgress(req.UserID, req.TaskID, req.Status, req.Message, req.Progress)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Restore progress notification sent",
	})
}

// handleMessagePlatformStatus 处理消息平台状态通知
func handleMessagePlatformStatus(c *gin.Context) {
	var req struct {
		Platform string `json:"platform" binding:"required"`
		Status   string `json:"status" binding:"required"` // connected, disconnected, error
		Error    string `json:"error"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request: " + err.Error(),
		})
		return
	}

	pushService.NotifyMessagePlatformStatus(req.Platform, req.Status, req.Error)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Message platform status notification sent",
	})
}

// PushService 引用（实际实现参见 internal/api/push.go）
var _ = (*api.PushService)(nil)

// RestoreProgressPayload 类型引用，确保 websocket 包被正确导入
var _ = websocket.RestoreProgressPayload{}