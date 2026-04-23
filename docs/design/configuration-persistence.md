# 配置持久化方案设计

## 1. 背景

Hermes Console 是 Hermes Agent 的 Web 配置控制台，当前处于 MVP 阶段（v0.1.0）。本设计方案针对三期迭代的 **P0 级任务：配置持久化方案设计**。

### 1.1 需求概述

| 需求 | 描述 |
|------|------|
| 配置数据模型设计 | 统一前端 TypeScript 类型与后端 Go 结构 |
| PostgreSQL 配置表和审计日志表设计 | 关系型数据库持久化存储 |
| 敏感信息（API Key）AES-256-GCM 加密存储 | 安全加密方案 |
| 配置版本管理和历史记录 | 配置变更追踪 |
| 配置变更 Diff 展示 + 一键回滚 | 版本对比与回滚功能 |

---

## 2. 配置数据模型设计

### 2.1 配置模块分类

根据 `src/types/config.ts` 和 `src/lib/config/types.ts` 的分析，配置分为以下模块：

| 模块 | 配置项 | 优先级 | 敏感字段 |
|------|--------|--------|----------|
| **model** | default_model, provider, base_url, api_key | P0 | api_key |
| **agent** | max_turns, gateway_timeout, tool_use_enforcement, reasoning_effort, personalities | P0 | - |
| **terminal** | docker_image, cpu, memory, disk, timeout, workdir | P0 | - |
| **browser** | inactivity_timeout, cdp_url, session_recording | P0 | - |
| **display** | compact_mode, personality_select, reasoning_display, streaming_output | P0 | - |
| **code_execution** | mode, timeout | P0 | - |
| **security** | redact_secrets, tirith, website_blacklist | P0 | - |
| **memory** | enabled, memory_limit, strategy | P0 | - |
| **auxiliary** | vision, web_extract, compression, session_search, skills_hub, mcp, memory | P1 | - |
| **tts** | provider | P2 | - |
| **stt** | provider | P2 | - |
| **message_platform** | discord, telegram, slack, whatsapp, qq_bot | P1 | 平台 Webhook/Bot Tokens |

### 2.2 Go 数据模型定义

```go
// config.go

package config

// ModelConfig 模型配置
type ModelConfig struct {
    DefaultModel string `json:"default_model" db:"default_model"`
    Provider     string `json:"provider" db:"provider"`
    BaseURL     string `json:"base_url,omitempty" db:"base_url"`
    APIKey      string `json:"-" db:"api_key_encrypted"` // 加密存储
}

// AgentConfig Agent配置
type AgentConfig struct {
    MaxTurns         int      `json:"max_turns" db:"max_turns"`
    GatewayTimeout   int      `json:"gateway_timeout" db:"gateway_timeout"`
    ToolUseEnforcement string `json:"tool_use_enforcement" db:"tool_use_enforcement"`
    ReasoningEffort  string   `json:"reasoning_effort" db:"reasoning_effort"`
    Personalities    []string `json:"personalities" db:"personalities"`
}

// TerminalConfig 终端配置
type TerminalConfig struct {
    DockerImage string `json:"docker_image" db:"docker_image"`
    CPU         int    `json:"cpu" db:"cpu"`
    Memory      string `json:"memory" db:"memory"`
    Disk        string `json:"disk" db:"disk"`
    Timeout     int    `json:"timeout" db:"timeout"`
    Workdir     string `json:"workdir" db:"workdir"`
}

// BrowserConfig 浏览器配置
type BrowserConfig struct {
    InactivityTimeout int    `json:"inactivity_timeout" db:"inactivity_timeout"`
    CDPURL            string `json:"cdp_url" db:"cdp_url"`
    SessionRecording  bool   `json:"session_recording" db:"session_recording"`
}

// DisplayConfig 显示配置
type DisplayConfig struct {
    CompactMode       bool   `json:"compact_mode" db:"compact_mode"`
    PersonalitySelect string `json:"personality_select" db:"personality_select"`
    ReasoningDisplay  bool   `json:"reasoning_display" db:"reasoning_display"`
    StreamingOutput   bool   `json:"streaming_output" db:"streaming_output"`
}

// CodeExecutionConfig 代码执行配置
type CodeExecutionConfig struct {
    Mode    string `json:"mode" db:"mode"`
    Timeout int    `json:"timeout" db:"timeout"`
}

// SecurityConfig 安全配置
type SecurityConfig struct {
    RedactSecrets    bool              `json:"redact_secrets" db:"redact_secrets"`
    Tirith           map[string]any    `json:"tirith" db:"tirith"` // JSONB
    WebsiteBlacklist  []string          `json:"website_blacklist" db:"website_blacklist"`
}

// MemoryConfig 记忆配置
type MemoryConfig struct {
    Enabled     bool   `json:"enabled" db:"enabled"`
    MemoryLimit string `json:"memory_limit" db:"memory_limit"`
    Strategy    string `json:"strategy" db:"strategy"`
}

// AuxiliaryConfig 辅助功能配置
type AuxiliaryConfig struct {
    Vision        bool            `json:"vision" db:"vision"`
    WebExtract    bool            `json:"web_extract" db:"web_extract"`
    Compression   bool            `json:"compression" db:"compression"`
    SessionSearch bool            `json:"session_search" db:"session_search"`
    SkillsHub     bool            `json:"skills_hub" db:"skills_hub"`
    MCP           map[string]any `json:"mcp,omitempty" db:"mcp"`
    Memory        map[string]any `json:"memory,omitempty" db:"memory_aux"`
}

// TTSConfig TTS配置
type TTSConfig struct {
    Provider string `json:"provider" db:"provider"`
}

// STTConfig STT配置
type STTConfig struct {
    Provider string `json:"provider" db:"provider"`
}

// MessagePlatformConfig 消息平台配置
type MessagePlatformConfig struct {
    Discord   map[string]any `json:"discord,omitempty" db:"discord"`
    Telegram  map[string]any `json:"telegram,omitempty" db:"telegram"`
    Slack     map[string]any `json:"slack,omitempty" db:"slack"`
    WhatsApp  map[string]any `json:"whatsapp,omitempty" db:"whatsapp"`
    QQBot     map[string]any `json:"qq_bot,omitempty" db:"qq_bot"`
}

// HermesConfig 完整配置
type HermesConfig struct {
    ID              int64                  `json:"id" db:"id"`
    Version         int                    `json:"version" db:"version"`
    Name            string                 `json:"name" db:"name"`
    IsActive        bool                   `json:"is_active" db:"is_active"`
    Model           *ModelConfig           `json:"model,omitempty"`
    Agent           *AgentConfig           `json:"agent,omitempty"`
    Terminal        *TerminalConfig        `json:"terminal,omitempty"`
    Browser         *BrowserConfig         `json:"browser,omitempty"`
    Display         *DisplayConfig         `json:"display,omitempty"`
    CodeExecution   *CodeExecutionConfig   `json:"code_execution,omitempty"`
    Security        *SecurityConfig        `json:"security,omitempty"`
    Memory          *MemoryConfig          `json:"memory,omitempty"`
    Auxiliary       *AuxiliaryConfig      `json:"auxiliary,omitempty"`
    TTS             *TTSConfig             `json:"tts,omitempty"`
    STT             *STTConfig             `json:"stt,omitempty"`
    MessagePlatform *MessagePlatformConfig `json:"message_platform,omitempty"`
    CreatedAt       time.Time              `json:"created_at" db:"created_at"`
    UpdatedAt       time.Time              `json:"updated_at" db:"updated_at"`
    CreatedBy       string                 `json:"created_by" db:"created_by"`
    UpdatedBy       string                 `json:"updated_by" db:"updated_by"`
}
```

---

## 3. 数据库 Schema 设计

### 3.1 ER 图

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  configurations │       │ config_versions  │       │   audit_logs    │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)          │       │ id (PK)         │
│ name            │  │    │ config_id (FK)  │───────→│ config_id (FK)  │
│ version         │  │    │ version         │       │ version         │
│ is_active       │  │    │ config_snapshot │       │ action          │
│ config_data     │  │    │ change_summary  │       │ diff            │
│ created_at      │  │    │ created_at      │       │ old_version     │
│ updated_at      │  │    │ created_by      │       │ new_version     │
│ created_by      │  │    └──────────────────┘       │ user_id         │
│ updated_by      │  │                               │ created_at      │
└─────────────────┘  │                               └─────────────────┘
                     │
                     │    ┌──────────────────┐
                     │    │   users          │
                     └───→│ id (PK)          │
                          │ username         │
                          │ email            │
                          └──────────────────┘
```

### 3.2 表结构 SQL

```sql
-- migrations/001_create_config_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: configurations
-- Description: 配置文件主表
-- ============================================
CREATE TABLE configurations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL UNIQUE,
    version         INTEGER NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    config_data     JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      BIGINT REFERENCES users(id),
    updated_by      BIGINT REFERENCES users(id),

    -- 约束
    CONSTRAINT valid_version CHECK (version >= 1)
);

-- 索引
CREATE INDEX idx_configurations_name ON configurations(name);
CREATE INDEX idx_configurations_is_active ON configurations(is_active);
CREATE INDEX idx_configurations_updated_at ON configurations(updated_at);

-- ============================================
-- Table: config_versions
-- Description: 配置版本历史表
-- ============================================
CREATE TABLE config_versions (
    id              BIGSERIAL PRIMARY KEY,
    config_id       BIGINT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL,
    config_snapshot JSONB NOT NULL,
    change_summary  TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by      BIGINT REFERENCES users(id),

    -- 复合唯一索引
    CONSTRAINT unique_config_version UNIQUE (config_id, version),

    -- 约束
    CONSTRAINT valid_version CHECK (version >= 1)
);

-- 索引
CREATE INDEX idx_config_versions_config_id ON config_versions(config_id);
CREATE INDEX idx_config_versions_version ON config_versions(config_id, version DESC);
CREATE INDEX idx_config_versions_created_at ON config_versions(created_at);

-- ============================================
-- Table: audit_logs
-- Description: 审计日志表
-- ============================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    config_id       BIGINT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL,
    action          VARCHAR(50) NOT NULL,
    diff            JSONB,
    old_version     INTEGER,
    new_version     INTEGER,
    user_id         BIGINT REFERENCES users(id),
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- 约束
    CONSTRAINT valid_action CHECK (action IN ('create', 'update', 'delete', 'restore', 'rollback'))
);

-- 索引
CREATE INDEX idx_audit_logs_config_id ON audit_logs(config_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- Table: users (简化版)
-- Description: 用户表
-- ============================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- Table: encryption_keys
-- Description: 加密密钥管理表
-- ============================================
CREATE TABLE encryption_keys (
    id              BIGSERIAL PRIMARY KEY,
    key_id          VARCHAR(100) NOT NULL UNIQUE,
    encrypted_key   BYTEA NOT NULL,
    key_version     INTEGER NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_by      BIGINT REFERENCES users(id),

    CONSTRAINT unique_key_id_version UNIQUE (key_id, key_version)
);

CREATE INDEX idx_encryption_keys_key_id ON encryption_keys(key_id);
CREATE INDEX idx_encryption_keys_is_active ON encryption_keys(is_active);
```

### 3.3 触发器：自动更新 updated_at

```sql
-- migrations/002_create_updated_at_trigger.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configurations_updated_at
    BEFORE UPDATE ON configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. AES-256-GCM 加密存储方案

### 4.1 加密策略

| 字段 | 加密方式 | 说明 |
|------|----------|------|
| api_key | AES-256-GCM | 主加密算法 |
| message_platform.*.webhook | AES-256-GCM | 消息平台 Webhook |
| message_platform.*.bot_token | AES-256-GCM | 消息平台 Bot Token |
| encryption_keys.encrypted_key | AES-256-GCM | 密钥加密密钥 (KEK) |

### 4.2 加密流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        加密流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Master Key (KEK)                                             │
│     │                                                            │
│     ├── 从环境变量或密钥管理服务获取                               │
│     │                                                            │
│  2. 生成随机 Data Key (DEK)                                      │
│     │                                                            │
│     ├── crypto.randomBytes(32) → 256-bit key                     │
│     │                                                            │
│  3. 用 DEK 加密敏感字段                                           │
│     │                                                            │
│     ├── iv = crypto.randomBytes(16)                             │
│     ├── cipher = AES-256-GCM(iv)                                │
│     ├── ciphertext = cipher.update(plaintext)                   │
│     ├── tag = cipher.getAuthTag()                               │
│     │                                                            │
│  4. 用 KEK 加密 DEK                                              │
│     │                                                            │
│     └── encrypted_dek = encrypt(dek, kek)                       │
│                                                                  │
│  5. 存储格式                                                      │
│     │                                                            │
│     └── {encrypted_dek}.{iv}.{tag}.{ciphertext} (Base64)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Go 加密实现

```go
// encryption.go

package crypto

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "encoding/base64"
    "errors"
    "io"
)

const (
    KeySize   = 32 // 256 bits
    IVSize    = 12 // 96 bits for GCM (recommended)
    TagSize   = 16 // 128 bits
    SaltSize  = 32 // for key derivation
)

// EncryptedData 加密后的数据结构
type EncryptedData struct {
    EncryptedDEK []byte `json:"encrypted_dek"` // 用 KEK 加密的 DEK
    IV           []byte `json:"iv"`            // 初始向量
    Tag          []byte `json:"tag"`           // 认证标签
    Ciphertext   []byte `json:"ciphertext"`    // 密文
}

// KeyEnvelope 密钥信封
type KeyEnvelope struct {
    KeyID      string        `json:"key_id"`
    EncryptedDEK []byte      `json:"encrypted_dek"`
    Version    int           `json:"version"`
}

// Encrypt 加密敏感数据
func Encrypt(plaintext []byte, kek []byte) (*EncryptedData, error) {
    // 1. 生成随机 DEK
    dek := make([]byte, KeySize)
    if _, err := io.ReadFull(rand.Reader, dek); err != nil {
        return nil, err
    }

    // 2. 用 DEK 加密数据
    iv := make([]byte, IVSize)
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return nil, err
    }

    block, err := aes.NewCipher(dek)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    ciphertext := gcm.Seal(nil, iv, plaintext, nil)
    tag := ciphertext[len(ciphertext)-TagSize:]
    ciphertext = ciphertext[:len(ciphertext)-TagSize]

    // 3. 用 KEK 加密 DEK
    encryptedDEK, err := encryptWithKEK(dek, kek)
    if err != nil {
        return nil, err
    }

    return &EncryptedData{
        EncryptedDEK: encryptedDEK,
        IV:           iv,
        Tag:          tag,
        Ciphertext:   ciphertext,
    }, nil
}

// Decrypt 解密敏感数据
func Decrypt(data *EncryptedData, kek []byte) ([]byte, error) {
    // 1. 用 KEK 解密 DEK
    dek, err := decryptWithKEK(data.EncryptedDEK, kek)
    if err != nil {
        return nil, err
    }

    // 2. 用 DEK 解密数据
    block, err := aes.NewCipher(dek)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    ciphertext := append(data.Ciphertext, data.Tag...)
    plaintext, err := gcm.Open(nil, data.IV, ciphertext, nil)
    if err != nil {
        return nil, err
    }

    return plaintext, nil
}

// encryptWithKEK 用 KEK 加密 DEK
func encryptWithKEK(dek, kek []byte) ([]byte, error) {
    iv := make([]byte, IVSize)
    if _, err := io.ReadFull(rand.Reader, iv); err != nil {
        return nil, err
    }

    block, err := aes.NewCipher(kek)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    ciphertext := gcm.Seal(nil, iv, dek, nil)
    return ciphertext, nil
}

// decryptWithKEK 用 KEK 解密 DEK
func decryptWithKEK(ciphertext, kek []byte) ([]byte, error) {
    iv := ciphertext[:IVSize]
    encryptedDEK := ciphertext[IVSize:]

    block, err := aes.NewCipher(kek)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    dek, err := gcm.Open(nil, iv, encryptedDEK, nil)
    if err != nil {
        return nil, err
    }

    return dek, nil
}

// MarshalBinary 序列化为单个字节数组
func (e *EncryptedData) MarshalBinary() ([]byte, error) {
    // 格式: len(encryptedDEK)|encryptedDEK|len(iv)|iv|len(tag)|tag|ciphertext
    result := make([]byte, 0, len(e.EncryptedDEK)+len(e.IV)+len(e.Tag)+len(e.Ciphertext)+12)

    // encryptedDEK
    result = appendVarint(result, len(e.EncryptedDEK))
    result = append(result, e.EncryptedDEK...)

    // iv
    result = appendVarint(result, len(e.IV))
    result = append(result, e.IV...)

    // tag
    result = appendVarint(result, len(e.Tag))
    result = append(result, e.Tag...)

    // ciphertext
    result = appendVarint(result, len(e.Ciphertext))
    result = append(result, e.Ciphertext...)

    return result, nil
}

// appendVarint 添加 varint 编码的长度
func appendVarint(b []byte, v int) []byte {
    for v >= 0x80 {
        b = append(b, byte(v)|0x80)
        v >>= 7
    }
    b = append(b, byte(v))
    return b
}

// ToBase64 转换为 Base64 字符串
func (e *EncryptedData) ToBase64() string {
    data, _ := e.MarshalBinary()
    return base64.StdEncoding.EncodeToString(data)
}

// FromBase64 从 Base64 字符串解析
func (e *EncryptedData) FromBase64(s string) error {
    data, err := base64.StdEncoding.DecodeString(s)
    if err != nil {
        return err
    }

    return e.UnmarshalBinary(data)
}
```

### 4.4 敏感字段自动加密

```go
// config_encryption.go

package config

import (
    "encoding/json"
    "strings"
)

// SensitiveFields 需要加密的字段路径
var SensitiveFields = []string{
    "model.api_key",
    "message_platform.discord.webhook",
    "message_platform.discord.bot_token",
    "message_platform.telegram.webhook",
    "message_platform.telegram.bot_token",
    "message_platform.slack.webhook",
    "message_platform.slack.bot_token",
    "message_platform.whatsapp.webhook",
    "message_platform.whatsapp.bot_token",
    "message_platform.qq_bot.webhook",
    "message_platform.qq_bot.bot_token",
}

// EncryptSensitiveFields 加密配置中的敏感字段
func (c *HermesConfig) EncryptSensitiveFields(cryptoService *CryptoService) error {
    data, err := json.Marshal(c)
    if err != nil {
        return err
    }

    var jsonData map[string]any
    if err := json.Unmarshal(data, &jsonData); err != nil {
        return err
    }

    for _, field := range SensitiveFields {
        if err := encryptField(jsonData, field, cryptoService); err != nil {
            return err
        }
    }

    // 重新赋值回结构体
    encryptedData, err := json.Marshal(jsonData)
    if err != nil {
        return err
    }

    return json.Unmarshal(encryptedData, c)
}

// decryptField 解密单个字段
func encryptField(data map[string]any, path string, svc *CryptoService) error {
    parts := strings.Split(path, ".")
    if len(parts) < 2 {
        return nil
    }

    // 导航到目标字段的父级
    current := data
    for i := 0; i < len(parts)-1; i++ {
        if next, ok := current[parts[i]].(map[string]any); ok {
            current = next
        } else {
            return nil // 字段不存在
        }
    }

    // 获取字段名和值
    fieldName := parts[len(parts)-1]
    if value, ok := current[fieldName].(string); ok && value != "" {
        encrypted, err := svc.Encrypt(value)
        if err != nil {
            return err
        }
        current[fieldName] = encrypted.ToBase64()
    }

    return nil
}
```

---

## 5. 配置版本管理和历史记录方案

### 5.1 版本管理策略

```
┌─────────────────────────────────────────────────────────────────┐
│                    配置版本管理流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 创建配置 (v1)                                                │
│     │                                                            │
│     └── INSERT INTO configurations                               │
│         INSERT INTO config_versions (version=1)                  │
│         INSERT INTO audit_logs (action='create')                 │
│                                                                  │
│  2. 更新配置                                                      │
│     │                                                            │
│     ├── UPDATE configurations SET version = version + 1         │
│     ├── INSERT INTO config_versions (新版本快照)                  │
│     └── INSERT INTO audit_logs (action='update', diff=...)      │
│                                                                  │
│  3. 回滚到历史版本                                                │
│     │                                                            │
│     ├── SELECT config_snapshot FROM config_versions             │
│     │   WHERE config_id = ? AND version = ?                     │
│     ├── UPDATE configurations (应用快照, version++)              │
│     ├── INSERT INTO config_versions (新版本)                     │
│     └── INSERT INTO audit_logs (action='rollback')              │
│                                                                  │
│  4. 查看历史                                                      │
│     │                                                            │
│     └── SELECT * FROM config_versions                           │
│         WHERE config_id = ? ORDER BY version DESC               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 版本数据表操作

```sql
-- 获取配置版本历史
CREATE OR REPLACE FUNCTION get_config_history(
    p_config_id BIGINT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    version BIGINT,
    change_summary TEXT,
    created_at TIMESTAMPTZ,
    created_by_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cv.version,
        cv.change_summary,
        cv.created_at,
        COALESCE(u.username, 'system')::VARCHAR(255)
    FROM config_versions cv
    LEFT JOIN users u ON cv.created_by = u.id
    WHERE cv.config_id = p_config_id
    ORDER BY cv.version DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 创建配置变更摘要
CREATE OR REPLACE FUNCTION generate_change_summary(
    old_data JSONB,
    new_data JSONB
) RETURNS TEXT AS $$
DECLARE
    summary TEXT := '';
    key TEXT;
BEGIN
    FOR key IN SELECT jsonb_object_keys(old_data) UNION SELECT jsonb_object_keys(new_data)
    LOOP
        IF old_data->key IS DISTINCT FROM new_data->key THEN
            summary := summary || CASE WHEN summary = '' THEN '' ELSE ', ' END ||
                      key || ': ' ||
                      coalesce(old_data->>key, 'null') || ' -> ' ||
                      coalesce(new_data->>key, 'null');
        END IF;
    END LOOP;
    RETURN summary;
END;
$$ LANGUAGE plpgsql;

-- 回滚配置
CREATE OR REPLACE FUNCTION rollback_config(
    p_config_id BIGINT,
    p_target_version INTEGER,
    p_user_id BIGINT
) RETURNS BIGINT AS $$
DECLARE
    v_snapshot JSONB;
    v_new_version INTEGER;
BEGIN
    -- 获取目标版本快照
    SELECT config_snapshot INTO v_snapshot
    FROM config_versions
    WHERE config_id = p_config_id AND version = p_target_version;

    IF v_snapshot IS NULL THEN
        RAISE EXCEPTION 'Version % not found for config %', p_target_version, p_config_id;
    END IF;

    -- 获取当前版本号
    SELECT version INTO v_new_version FROM configurations WHERE id = p_config_id;

    -- 更新配置
    UPDATE configurations
    SET config_data = v_snapshot,
        version = v_new_version + 1,
        updated_by = p_user_id,
        updated_at = NOW()
    WHERE id = p_config_id;

    -- 记录新版本
    INSERT INTO config_versions (config_id, version, config_snapshot, change_summary, created_by)
    VALUES (p_config_id, v_new_version + 1, v_snapshot,
            'Rollback to version ' || p_target_version, p_user_id);

    -- 记录审计日志
    INSERT INTO audit_logs (config_id, version, action, old_version, new_version, user_id)
    VALUES (p_config_id, v_new_version + 1, 'rollback', v_new_version, v_new_version + 1, p_user_id);

    RETURN v_new_version + 1;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Diff 生成

```go
// diff.go

package config

import (
    "encoding/json"
    "reflect"
)

// DiffEntry 配置变更条目
type DiffEntry struct {
    Path     string      `json:"path"`
    OldValue interface{} `json:"old_value"`
    NewValue interface{} `json:"new_value"`
}

// ConfigDiff 配置变更差异
type ConfigDiff struct {
    ConfigID    int64       `json:"config_id"`
    OldVersion  int         `json:"old_version"`
    NewVersion  int         `json:"new_version"`
    Changes     []DiffEntry `json:"changes"`
    Summary     string      `json:"summary"`
}

// GenerateDiff 生成两个配置版本的差异
func GenerateDiff(oldConfig, newConfig map[string]interface{}) *ConfigDiff {
    var changes []DiffEntry

    compareValues("", reflect.ValueOf(oldConfig), reflect.ValueOf(newConfig), &changes)

    summary := generateSummary(changes)

    return &ConfigDiff{
        Changes: changes,
        Summary: summary,
    }
}

func compareValues(path string, oldVal, newVal reflect.Value, changes *[]DiffEntry) {
    // 处理 nil 情况
    oldIsNil := !oldVal.IsValid()
    newIsNil := !newVal.IsValid()

    if oldIsNil && newIsNil {
        return
    }

    if oldIsNil || newIsNil {
        *changes = append(*changes, DiffEntry{
            Path:     path,
            OldValue: safeValue(oldVal),
            NewValue: safeValue(newVal),
        })
        return
    }

    // 根据类型处理
    switch oldVal.Kind() {
    case reflect.Map:
        compareMaps(path, oldVal, newVal, changes)
    case reflect.Slice:
        compareSlices(path, oldVal, newVal, changes)
    case reflect.Struct:
        compareStructs(path, oldVal, newVal, changes)
    default:
        if !reflect.DeepEqual(oldVal.Interface(), newVal.Interface()) {
            *changes = append(*changes, DiffEntry{
                Path:     path,
                OldValue: oldVal.Interface(),
                NewValue: newVal.Interface(),
            })
        }
    }
}

func compareMaps(path string, oldVal, newVal reflect.Value, changes *[]DiffEntry) {
    oldMap := oldVal.Interface().(map[string]interface{})
    newMap := newVal.Interface().(map[string]interface{})

    allKeys := make(map[string]bool)
    for k := range oldMap {
        allKeys[k] = true
    }
    for k := range newMap {
        allKeys[k] = true
    }

    for key := range allKeys {
        newPath := path + "." + key
        oldField := reflect.ValueOf(oldMap[key])
        newField := reflect.ValueOf(newMap[key])
        compareValues(newPath, oldField, newField, changes)
    }
}

func compareStructs(path string, oldVal, newVal reflect.Value, changes *[]DiffEntry) {
    for i := 0; i < oldVal.NumField(); i++ {
        field := oldVal.Type().Field(i)
        jsonTag := field.Tag.Get("json")

        // 跳过隐藏字段和敏感字段
        if jsonTag == "-" || jsonTag == "api_key" {
            continue
        }

        fieldPath := path + "." + jsonTag
        compareValues(fieldPath, oldVal.Field(i), newVal.Field(i), changes)
    }
}

func safeValue(v reflect.Value) interface{} {
    if !v.IsValid() {
        return nil
    }
    return v.Interface()
}

func generateSummary(changes []DiffEntry) string {
    if len(changes) == 0 {
        return "No changes"
    }

    summary := ""
    for i, change := range changes {
        if i > 0 {
            summary += ", "
        }
        if len(changes) > 3 && i == 2 {
            summary += "..."
            break
        }
        summary += change.Path + ": " + formatValue(change.OldValue) + " -> " + formatValue(change.NewValue)
    }
    return summary
}

func formatValue(v interface{}) string {
    if v == nil {
        return "null"
    }
    switch val := v.(type) {
    case string:
        if len(val) > 20 {
            return val[:20] + "..."
        }
        return val
    default:
        b, _ := json.Marshal(val)
        return string(b)
    }
}
```

---

## 6. API 设计

### 6.1 RESTful API 端点

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | /api/v1/configs | 获取所有配置列表 |
| GET | /api/v1/configs/{name} | 获取指定配置 |
| POST | /api/v1/configs | 创建新配置 |
| PUT | /api/v1/configs/{name} | 更新配置 |
| DELETE | /api/v1/configs/{name} | 删除配置 |
| GET | /api/v1/configs/{name}/history | 获取配置版本历史 |
| GET | /api/v1/configs/{name}/diff | 获取两个版本的差异 |
| POST | /api/v1/configs/{name}/rollback | 回滚到指定版本 |
| GET | /api/v1/audit/logs | 获取审计日志 |
| GET | /api/v1/audit/logs/{config_id} | 获取指定配置的审计日志 |

### 6.2 API 响应格式

```go
// API 统一响应格式
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *APIError   `json:"error,omitempty"`
    Meta    *Meta       `json:"meta,omitempty"`
}

type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

type Meta struct {
    Page       int `json:"page"`
    PerPage    int `json:"per_page"`
    Total      int `json:"total"`
    TotalPages int `json:"total_pages"`
}

// 成功响应
{
    "success": true,
    "data": { ... },
    "meta": {
        "page": 1,
        "per_page": 20,
        "total": 100,
        "total_pages": 5
    }
}

// 错误响应
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "配置验证失败",
        "details": "api_key 格式不正确"
    }
}
```

---

## 7. 目录结构

```
hermes-console/
├── backend/                          # Go 后端
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   ├── config.go            # 配置数据模型
│   │   │   ├── config_service.go    # 配置服务
│   │   │   ├── config_repository.go # 数据库操作
│   │   │   └── diff.go              # Diff 生成
│   │   ├── crypto/
│   │   │   ├── encryption.go        # AES-256-GCM 加密
│   │   │   └── key_manager.go       # 密钥管理
│   │   ├── audit/
│   │   │   ├── audit.go             # 审计日志模型
│   │   │   └── audit_service.go     # 审计服务
│   │   ├── api/
│   │   │   ├── router.go            # 路由定义
│   │   │   ├── config_handler.go    # 配置 API 处理
│   │   │   └── audit_handler.go     # 审计 API 处理
│   │   └── middleware/
│   │       ├── auth.go              # 认证中间件
│   │       └── logging.go           # 日志中间件
│   ├── pkg/
│   │   └── response/
│   │       └── response.go          # 统一响应
│   ├── migrations/                   # 数据库迁移
│   │   ├── 001_create_config_tables.sql
│   │   └── 002_create_updated_at_trigger.sql
│   └── go.mod
├── src/                             # Next.js 前端
│   └── ...
└── docs/
    └── design/
        └── configuration-persistence.md  # 本文档
```

---

## 8. 验收标准检查

| 验收项 | 状态 | 说明 |
|--------|------|------|
| 配置数据模型设计完成 | ✅ | Go 结构体与 TypeScript 类型对齐 |
| 数据库 Schema 设计完成 | ✅ | 包含 configurations, config_versions, audit_logs, users, encryption_keys 表 |
| 加密存储方案设计完成 | ✅ | AES-256-GCM + KEK/DEK 两层加密 |
| 配置版本管理方案设计完成 | ✅ | 版本历史记录、快照存储、回滚函数 |
| Diff 展示方案设计完成 | ✅ | JSON 结构化 diff + 人类可读摘要 |
| API 接口设计完成 | ✅ | RESTful API 端点定义 |

---

## 9. 后续任务

| 任务 | 类型 | 负责人 |
|------|------|--------|
| 创建 Go 项目结构 | Backend 开发 | Backend |
| 实现数据库迁移 | Backend 开发 | Backend |
| 实现 AES-256-GCM 加密服务 | Backend 开发 | Backend |
| 实现配置 CRUD API | Backend 开发 | Backend |
| 实现版本管理和回滚 API | Backend 开发 | Backend |
| 实现 Diff API | Backend 开发 | Backend |
| 实现审计日志 API | Backend 开发 | Backend |
| 前端配置管理界面 | Frontend 开发 | UI |
| 前端版本历史界面 | Frontend 开发 | UI |
| 前端 Diff 展示界面 | Frontend 开发 | UI |
| 前端回滚功能 | Frontend 开发 | UI |
