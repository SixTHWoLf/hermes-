package api

import (
	"time"

	"github.com/SixTHWoLf/hermes-/backend/internal/websocket"
)

// PushService 推送服务
type PushService struct {
	hub *websocket.Hub
}

// NewPushService 创建推送服务
func NewPushService(hub *websocket.Hub) *PushService {
	return &PushService{hub: hub}
}

// NotifyConfigChange 通知配置变更
func (s *PushService) NotifyConfigChange(configID, configType, action string) {
	s.hub.SendConfigChange(&websocket.ConfigChangePayload{
		ConfigID:   configID,
		ConfigType: configType,
		Action:     action,
		Timestamp:  time.Now().Unix(),
	})
}

// NotifyBackupProgress 通知备份进度
func (s *PushService) NotifyBackupProgress(userID, taskID, status, message string, progress float64) {
	s.hub.SendBackupProgress(userID, &websocket.BackupProgressPayload{
		TaskID:    taskID,
		Status:    status,
		Progress:  progress,
		Message:   message,
		Timestamp: time.Now().Unix(),
	})
}

// NotifyRestoreProgress 通知恢复进度
func (s *PushService) NotifyRestoreProgress(userID, taskID, status, message string, progress float64) {
	s.hub.SendRestoreProgress(userID, &websocket.RestoreProgressPayload{
		TaskID:    taskID,
		Status:    status,
		Progress:  progress,
		Message:   message,
		Timestamp: time.Now().Unix(),
	})
}

// NotifyMessagePlatformStatus 通知消息平台状态
func (s *PushService) NotifyMessagePlatformStatus(platform, status, errorMsg string) {
	s.hub.SendMessagePlatformStatus(&websocket.MessagePlatformStatusPayload{
		Platform:  platform,
		Status:    status,
		Error:     errorMsg,
		Timestamp: time.Now().Unix(),
	})
}