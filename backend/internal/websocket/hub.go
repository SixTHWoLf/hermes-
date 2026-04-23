package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// 心跳间隔 30秒
	pongWait = 30 * time.Second
	// 发送超时时间
	writeWait = 10 * time.Second
	//  ping 发送间隔
	pingPeriod = (pongWait * 9) / 10
)

// MessageType 消息类型
type MessageType string

const (
	// ConfigChange 配置变更
	ConfigChange MessageType = "config_change"
	// BackupProgress 备份进度
	BackupProgress MessageType = "backup_progress"
	// RestoreProgress 恢复进度
	RestoreProgress MessageType = "restore_progress"
	// MessagePlatformStatus 消息平台连接状态
	MessagePlatformStatus MessageType = "message_platform_status"
	// Error 错误消息
	Error MessageType = "error"
)

// Message 消息结构
type Message struct {
	Type    MessageType     `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// ConfigChangePayload 配置变更消息
type ConfigChangePayload struct {
	ConfigID   string `json:"config_id"`
	ConfigType string `json:"config_type"`
	Action     string `json:"action"` // created, updated, deleted
	Timestamp  int64  `json:"timestamp"`
}

// BackupProgressPayload 备份进度消息
type BackupProgressPayload struct {
	TaskID     string  `json:"task_id"`
	Status     string  `json:"status"` // running, completed, failed
	Progress   float64 `json:"progress"` // 0-100
	Message    string  `json:"message,omitempty"`
	Timestamp  int64   `json:"timestamp"`
}

// RestoreProgressPayload 恢复进度消息
type RestoreProgressPayload struct {
	TaskID     string  `json:"task_id"`
	Status     string  `json:"status"` // running, completed, failed
	Progress   float64 `json:"progress"` // 0-100
	Message    string  `json:"message,omitempty"`
	Timestamp  int64   `json:"timestamp"`
}

// MessagePlatformStatusPayload 消息平台状态
type MessagePlatformStatusPayload struct {
	Platform   string `json:"platform"`
	Status     string `json:"status"` // connected, disconnected, error
	Error      string `json:"error,omitempty"`
	Timestamp  int64  `json:"timestamp"`
}

// Client WebSocket 客户端连接
type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	userID   string
	metadata map[string]interface{}
}

// Hub WebSocket 连接池管理中心
type Hub struct {
	// 客户端映射
	clients map[*Client]bool

	// 用户 ID 到客户端的映射（支持多设备）
	userClients map[string][]*Client

	// 注册请求
	register chan *Client

	// 注销请求
	unregister chan *Client

	// 广播消息
	broadcast chan *BroadcastMessage

	// 发送给特定用户
	sendToUser chan *UserMessage

	// 互斥锁
	mu sync.RWMutex
}

// BroadcastMessage 广播消息结构
type BroadcastMessage struct {
	Type    MessageType
	Payload interface{}
}

// UserMessage 发送给特定用户的消息
type UserMessage struct {
	UserID  string
	Type    MessageType
	Payload interface{}
}

// NewHub 创建新的 Hub
func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		userClients: make(map[string][]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *BroadcastMessage, 256),
		sendToUser: make(chan *UserMessage, 256),
	}
}

// Run 启动 Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if client.userID != "" {
				h.userClients[client.userID] = append(h.userClients[client.userID], client)
			}
			h.mu.Unlock()
			log.Printf("客户端注册成功, 用户ID: %s, 当前连接数: %d", client.userID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				// 从用户映射中移除
				if client.userID != "" {
					clients := h.userClients[client.userID]
					for i, c := range clients {
						if c == client {
							h.userClients[client.userID] = append(clients[:i], clients[i+1:]...)
							break
						}
					}
					if len(h.userClients[client.userID]) == 0 {
						delete(h.userClients, client.userID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("客户端注销, 用户ID: %s, 当前连接数: %d", client.userID, len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			data, err := json.Marshal(message)
			if err != nil {
				log.Printf("广播消息序列化失败: %v", err)
				h.mu.RUnlock()
				continue
			}
			for client := range h.clients {
				select {
				case client.send <- data:
				default:
					h.mu.RUnlock()
					h.mu.Lock()
					close(client.send)
					delete(h.clients, client)
					h.mu.Unlock()
					h.mu.RLock()
				}
			}
			h.mu.RUnlock()

		case message := <-h.sendToUser:
			h.mu.RLock()
			clients := h.userClients[message.UserID]
			data, err := json.Marshal(message)
			if err != nil {
				log.Printf("用户消息序列化失败: %v", err)
				h.mu.RUnlock()
				continue
			}
			for _, client := range clients {
				select {
				case client.send <- data:
				default:
					// 客户端发送缓冲满，标记待关闭
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast 广播消息给所有客户端
func (h *Hub) Broadcast(msg *BroadcastMessage) {
	h.broadcast <- msg
}

// SendToUser 发送消息给特定用户
func (h *Hub) SendToUser(msg *UserMessage) {
	h.sendToUser <- msg
}

// GetClientCount 获取当前连接数
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// GetUserCount 获取当前用户数
func (h *Hub) GetUserCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.userClients)
}

// NewClient 创建新的客户端连接
func (h *Hub) NewClient(conn *websocket.Conn, userID string) *Client {
	return &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		userID:   userID,
		metadata: make(map[string]interface{}),
	}
}

// ReadPump 处理读取消息
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket 读取错误: %v", err)
			}
			break
		}

		// 处理客户端消息（目前主要用于心跳响应）
		log.Printf("收到客户端消息: %s", message)
	}
}

// WritePump 处理发送消息
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// 将排队的消息写入同一个 write
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// SendConfigChange 广播配置变更
func (h *Hub) SendConfigChange(payload *ConfigChangePayload) {
	h.Broadcast(&BroadcastMessage{
		Type:    ConfigChange,
		Payload: payload,
	})
}

// SendBackupProgress 发送备份进度给特定用户
func (h *Hub) SendBackupProgress(userID string, payload *BackupProgressPayload) {
	h.SendToUser(&UserMessage{
		UserID:  userID,
		Type:    BackupProgress,
		Payload: payload,
	})
}

// SendRestoreProgress 发送恢复进度给特定用户
func (h *Hub) SendRestoreProgress(userID string, payload *RestoreProgressPayload) {
	h.SendToUser(&UserMessage{
		UserID:  userID,
		Type:    RestoreProgress,
		Payload: payload,
	})
}

// SendMessagePlatformStatus 广播消息平台状态
func (h *Hub) SendMessagePlatformStatus(payload *MessagePlatformStatusPayload) {
	h.Broadcast(&BroadcastMessage{
		Type:    MessagePlatformStatus,
		Payload: payload,
	})
}

// SendError 发送错误消息给特定用户
func (h *Hub) SendError(userID string, errMsg string) {
	h.SendToUser(&UserMessage{
		UserID: userID,
		Type:   Error,
		Payload: map[string]string{
			"message": errMsg,
		},
	})
}