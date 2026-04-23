package models

import (
	"time"
)

// AuditLogType represents the type of change operation
type AuditLogType string

const (
	AuditLogTypeCreate AuditLogType = "create"
	AuditLogTypeUpdate AuditLogType = "update"
	AuditLogTypeDelete AuditLogType = "delete"
)

// AuditLog represents an audit log entry for configuration changes
type AuditLog struct {
	ID           string       `json:"id" db:"id"`
	UserID       string       `json:"user_id" db:"user_id"`
	UserName     string       `json:"user_name" db:"user_name"`
	Operation    AuditLogType `json:"operation" db:"operation"`
	ResourceType string       `json:"resource_type" db:"resource_type"`
	ResourceID   string       `json:"resource_id" db:"resource_id"`
	OldValue     string       `json:"old_value,omitempty" db:"old_value"`
	NewValue     string       `json:"new_value,omitempty" db:"new_value"`
	ChangeSummary string      `json:"change_summary" db:"change_summary"`
	CreatedAt    time.Time    `json:"created_at" db:"created_at"`
}

// AuditLogFilter represents filters for querying audit logs
type AuditLogFilter struct {
	UserID       string
	Operation    AuditLogType
	ResourceType string
	StartTime    *time.Time
	EndTime      *time.Time
	Page         int
	PageSize     int
}

// AuditLogListResponse represents paginated audit log response
type AuditLogListResponse struct {
	Data       []AuditLog `json:"data"`
	Total      int64      `json:"total"`
	Page       int        `json:"page"`
	PageSize   int        `json:"page_size"`
	TotalPages int        `json:"total_pages"`
}