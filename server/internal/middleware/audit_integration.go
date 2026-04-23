package middleware

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/SixTHWoLf/hermes/server/internal/models"
	"github.com/SixTHWoLf/hermes/server/pkg/audit"
	"github.com/go-chi/chi/v5"
)

// ConfigAuditor provides automatic audit logging for Chi route handlers
type ConfigAuditor struct {
	repo          *audit.Repository
	changeDetector *audit.ChangeDetector
}

// NewConfigAuditor creates a new configuration auditor
func NewConfigAuditor(repo *audit.Repository) *ConfigAuditor {
	return &ConfigAuditor{
		repo:          repo,
		changeDetector: audit.NewChangeDetector(),
	}
}

// AuditConfigChange creates a Chi middleware that automatically logs configuration changes
func (ca *ConfigAuditor) AuditConfigChange(resourceType string, operationType models.AuditLogType) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// Get resource ID from path
			resourceID := chi.URLParam(r, "id")
			if resourceID == "" {
				resourceID = "unknown"
			}

			// Get user info from context (set by auth middleware)
			userID := audit.GetUserIDFromContext(ctx)
			userName := audit.GetUserNameFromContext(ctx)

			// Store original values for comparison
			var oldValueJSON []byte

			// For update/delete, we might need to get the old value first
			// This would typically be done via a callback or by the handler itself
			if operationType == models.AuditLogTypeUpdate || operationType == models.AuditLogTypeDelete {
				if oldValue, ok := ctx.Value(ContextKey("old_value")).(interface{}); ok {
					oldValueJSON, _ = json.Marshal(oldValue)
				}
			}

			// Wrap response writer to capture status
			rw := &statusResponseWriter{ResponseWriter: w, status: http.StatusOK}

			// Process request
			next.ServeHTTP(rw, r)

			// Only audit successful operations
			if rw.status < 200 || rw.status >= 300 {
				return
			}

			// Get new value from context (set by handler after processing)
			var newValueJSON []byte
			if newValue, ok := ctx.Value(ContextKey("new_value")).(interface{}); ok {
				newValueJSON, _ = json.Marshal(newValue)
			}

			// Generate change summary
			var oldVal, newVal interface{}
			if len(oldValueJSON) > 0 {
				json.Unmarshal(oldValueJSON, &oldVal)
			}
			if len(newValueJSON) > 0 {
				json.Unmarshal(newValueJSON, &newVal)
			}

			summary := ca.changeDetector.ChangeSummary(
				resourceType,
				resourceID,
				oldVal,
				newVal,
				audit.OperationType(operationType),
			)

			// Create audit log
			auditLog := &models.AuditLog{
				UserID:        userID,
				UserName:      userName,
				Operation:     operationType,
				ResourceType:  resourceType,
				ResourceID:    resourceID,
				OldValue:      string(oldValueJSON),
				NewValue:      string(newValueJSON),
				ChangeSummary: summary,
			}

			ca.repo.Create(auditLog)
		})
	}
}

// ContextKey type for context values
type ContextKey = string

const (
	// ContextKeyOldValue is the context key for old value
	ContextKeyOldValue ContextKey = "audit_old_value"
	// ContextKeyNewValue is the context key for new value
	ContextKeyNewValue ContextKey = "audit_new_value"
)

// WithOldValue sets the old value in context for audit logging
func WithOldValue(ctx context.Context, val interface{}) context.Context {
	return context.WithValue(ctx, ContextKeyOldValue, val)
}

// WithNewValue sets the new value in context for audit logging
func WithNewValue(ctx context.Context, val interface{}) context.Context {
	return context.WithValue(ctx, ContextKeyNewValue, val)
}

type statusResponseWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusResponseWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}