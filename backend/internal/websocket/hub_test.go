package websocket

import (
	"encoding/json"
	"testing"
	"time"
)

// TestHubBroadcast 测试广播消息
func TestHubBroadcast(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// 创建测试消息
	testMsg := &BroadcastMessage{
		Type: ConfigChange,
		Payload: &ConfigChangePayload{
			ConfigID:   "test-config-1",
			ConfigType: "database",
			Action:     "updated",
			Timestamp:  time.Now().Unix(),
		},
	}

	// 广播消息
	hub.Broadcast(testMsg)

	// 等待消息处理
	time.Sleep(100 * time.Millisecond)

	// 验证连接数（没有客户端注册，所以不会崩溃）
	if hub.GetClientCount() != 0 {
		t.Errorf("Expected client count 0, got %d", hub.GetClientCount())
	}
}

// TestHubSendToUser 测试发送消息给特定用户
func TestHubSendToUser(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	testMsg := &UserMessage{
		UserID: "user-123",
		Type:   BackupProgress,
		Payload: &BackupProgressPayload{
			TaskID:    "task-1",
			Status:    "running",
			Progress:  50.0,
			Timestamp: time.Now().Unix(),
		},
	}

	hub.SendToUser(testMsg)

	time.Sleep(100 * time.Millisecond)

	// 验证用户数
	if hub.GetUserCount() != 0 {
		t.Errorf("Expected user count 0, got %d", hub.GetUserCount())
	}
}

// TestMessagePayloads 测试消息载荷序列化
func TestMessagePayloads(t *testing.T) {
	// 测试 ConfigChangePayload
	configPayload := ConfigChangePayload{
		ConfigID:   "config-1",
		ConfigType: "redis",
		Action:     "created",
		Timestamp:  time.Now().Unix(),
	}

	data, err := json.Marshal(configPayload)
	if err != nil {
		t.Errorf("Failed to marshal ConfigChangePayload: %v", err)
	}

	var decoded ConfigChangePayload
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Errorf("Failed to unmarshal ConfigChangePayload: %v", err)
	}

	if decoded.ConfigID != configPayload.ConfigID {
		t.Errorf("ConfigID mismatch: expected %s, got %s", configPayload.ConfigID, decoded.ConfigID)
	}

	// 测试 BackupProgressPayload
	backupPayload := BackupProgressPayload{
		TaskID:    "backup-1",
		Status:    "completed",
		Progress:  100.0,
		Message:   "Backup completed successfully",
		Timestamp: time.Now().Unix(),
	}

	data, err = json.Marshal(backupPayload)
	if err != nil {
		t.Errorf("Failed to marshal BackupProgressPayload: %v", err)
	}

	var decodedBackup BackupProgressPayload
	if err := json.Unmarshal(data, &decodedBackup); err != nil {
		t.Errorf("Failed to unmarshal BackupProgressPayload: %v", err)
	}

	if decodedBackup.Progress != backupPayload.Progress {
		t.Errorf("Progress mismatch: expected %f, got %f", backupPayload.Progress, decodedBackup.Progress)
	}

	// 测试 RestoreProgressPayload
	restorePayload := RestoreProgressPayload{
		TaskID:    "restore-1",
		Status:    "running",
		Progress:  75.0,
		Timestamp: time.Now().Unix(),
	}

	data, err = json.Marshal(restorePayload)
	if err != nil {
		t.Errorf("Failed to marshal RestoreProgressPayload: %v", err)
	}

	var decodedRestore RestoreProgressPayload
	if err := json.Unmarshal(data, &decodedRestore); err != nil {
		t.Errorf("Failed to unmarshal RestoreProgressPayload: %v", err)
	}

	if decodedRestore.Status != restorePayload.Status {
		t.Errorf("Status mismatch: expected %s, got %s", restorePayload.Status, decodedRestore.Status)
	}

	// 测试 MessagePlatformStatusPayload
	statusPayload := MessagePlatformStatusPayload{
		Platform:  "email",
		Status:    "connected",
		Timestamp: time.Now().Unix(),
	}

	data, err = json.Marshal(statusPayload)
	if err != nil {
		t.Errorf("Failed to marshal MessagePlatformStatusPayload: %v", err)
	}

	var decodedStatus MessagePlatformStatusPayload
	if err := json.Unmarshal(data, &decodedStatus); err != nil {
		t.Errorf("Failed to unmarshal MessagePlatformStatusPayload: %v", err)
	}

	if decodedStatus.Platform != statusPayload.Platform {
		t.Errorf("Platform mismatch: expected %s, got %s", statusPayload.Platform, decodedStatus.Platform)
	}
}

// TestHubClientCount 测试客户端计数
func TestHubClientCount(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// 初始状态
	if hub.GetClientCount() != 0 {
		t.Errorf("Expected initial client count 0, got %d", hub.GetClientCount())
	}

	if hub.GetUserCount() != 0 {
		t.Errorf("Expected initial user count 0, got %d", hub.GetUserCount())
	}
}

// TestMessageTypes 测试消息类型常量
func TestMessageTypes(t *testing.T) {
	if ConfigChange != "config_change" {
		t.Errorf("ConfigChange type mismatch")
	}

	if BackupProgress != "backup_progress" {
		t.Errorf("BackupProgress type mismatch")
	}

	if RestoreProgress != "restore_progress" {
		t.Errorf("RestoreProgress type mismatch")
	}

	if MessagePlatformStatus != "message_platform_status" {
		t.Errorf("MessagePlatformStatus type mismatch")
	}

	if Error != "error" {
		t.Errorf("Error type mismatch")
	}
}