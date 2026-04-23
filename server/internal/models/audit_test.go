package models

import (
	"testing"
	"time"
)

func TestAuditLogTypes(t *testing.T) {
	tests := []struct {
		name     string
		logType  AuditLogType
		expected string
	}{
		{"Create type", AuditLogTypeCreate, "create"},
		{"Update type", AuditLogTypeUpdate, "update"},
		{"Delete type", AuditLogTypeDelete, "delete"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if string(tt.logType) != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, string(tt.logType))
			}
		})
	}
}

func TestAuditLogFilter_Defaults(t *testing.T) {
	filter := AuditLogFilter{}

	if filter.Page != 0 {
		t.Errorf("expected Page to be 0, got %d", filter.Page)
	}
	if filter.PageSize != 0 {
		t.Errorf("expected PageSize to be 0, got %d", filter.PageSize)
	}
	if filter.StartTime != nil {
		t.Errorf("expected StartTime to be nil")
	}
	if filter.EndTime != nil {
		t.Errorf("expected EndTime to be nil")
	}
}

func TestAuditLogListResponse(t *testing.T) {
	logs := []AuditLog{
		{
			ID:           "test-id-1",
			UserID:       "user-1",
			UserName:     "Test User",
			Operation:    AuditLogTypeCreate,
			ResourceType: "model_config",
			ResourceID:   "config-1",
			ChangeSummary: "Created model config",
			CreatedAt:    time.Now(),
		},
	}

	response := AuditLogListResponse{
		Data:       logs,
		Total:      1,
		Page:       1,
		PageSize:   20,
		TotalPages: 1,
	}

	if len(response.Data) != 1 {
		t.Errorf("expected 1 log, got %d", len(response.Data))
	}
	if response.Total != 1 {
		t.Errorf("expected Total to be 1, got %d", response.Total)
	}
	if response.Page != 1 {
		t.Errorf("expected Page to be 1, got %d", response.Page)
	}
	if response.PageSize != 20 {
		t.Errorf("expected PageSize to be 20, got %d", response.PageSize)
	}
	if response.TotalPages != 1 {
		t.Errorf("expected TotalPages to be 1, got %d", response.TotalPages)
	}
}