package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/SixTHWoLf/hermes/server/internal/models"
	"github.com/SixTHWoLf/hermes/server/pkg/audit"
)

// AuditMiddleware provides automatic audit logging for configuration changes
type AuditMiddleware struct {
	repo          *audit.Repository
	changeDetector *audit.ChangeDetector
}

// NewAuditMiddleware creates a new audit middleware
func NewAuditMiddleware(repo *audit.Repository) *AuditMiddleware {
	return &AuditMiddleware{
		repo:          repo,
		changeDetector: audit.NewChangeDetector(),
	}
}

// ConfigChangeHandler wraps configuration change handlers with automatic audit logging
func (am *AuditMiddleware) ConfigChangeHandler(
	ctx context.Context,
	resourceType string,
	handler func(w http.ResponseWriter, r *http.Request),
	oldValueGetter func(id string) (interface{}, error),
	newValueGetter func(r *http.Request) (interface{}, error),
	operationType models.AuditLogType,
) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get resource ID from URL or request body
		resourceID := extractResourceID(r, resourceType)

		// Get old value for update/delete operations
		var oldValue []byte
		if operationType != models.AuditLogTypeCreate && oldValueGetter != nil {
			val, err := oldValueGetter(resourceID)
			if err == nil && val != nil {
				oldValue, _ = json.Marshal(val)
			}
		}

		// Execute the actual handler
		handler(w, r)

		// Only record if the request was successful (2xx status)
		if status := getResponseStatus(w); status < 200 || status >= 300 {
			return
		}

		// Get new value for create/update operations
		var newValue []byte
		if operationType != models.AuditLogTypeDelete && newValueGetter != nil {
			val, err := newValueGetter(r)
			if err == nil && val != nil {
				newValue, _ = json.Marshal(val)
			}
		}

		// Generate change summary
		var oldVal, newVal interface{}
		if len(oldValue) > 0 {
			json.Unmarshal(oldValue, &oldVal)
		}
		if len(newValue) > 0 {
			json.Unmarshal(newValue, &newVal)
		}

		summary := am.changeDetector.ChangeSummary(resourceType, resourceID, oldVal, newVal, audit.OperationType(operationType))

		// Record the audit log
		userID := audit.GetUserIDFromContext(ctx)
		userName := audit.GetUserNameFromContext(ctx)

		auditLog := &models.AuditLog{
			UserID:        userID,
			UserName:      userName,
			Operation:     operationType,
			ResourceType:  resourceType,
			ResourceID:    resourceID,
			OldValue:      string(oldValue),
			NewValue:      string(newValue),
			ChangeSummary: summary,
			CreatedAt:     time.Now(),
		}

		if err := am.repo.Create(auditLog); err != nil {
			// Log error but don't fail the request
			// In production, you might want to use a proper logger
		}
	}
}

// extractResourceID extracts the resource ID from the request
func extractResourceID(r *http.Request, resourceType string) string {
	// Try to get from URL path
	path := r.URL.Path
	parts := strings.Split(strings.Trim(path, "/"), "/")

	// Look for UUID pattern in path
	for i, part := range parts {
		if len(part) == 36 && containsHyphen(part) {
			return part
		}
		// Check if this is the resource type and next part is the ID
		if part == resourceType && i+1 < len(parts) {
			return parts[i+1]
		}
	}

	// Try to get from query string
	if id := r.URL.Query().Get("id"); id != "" {
		return id
	}

	return "unknown"
}

func containsHyphen(s string) bool {
	for _, c := range s {
		if c == '-' {
			return true
		}
	}
	return false
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func getResponseStatus(w http.ResponseWriter) int {
	if rw, ok := w.(*responseWriter); ok {
		return rw.status
	}
	return http.StatusOK
}

// AuditResponseWriter wraps ResponseWriter to capture status for audit logging
func AuditResponseWriter(w http.ResponseWriter) (*responseWriter, int) {
	return &responseWriter{ResponseWriter: w, status: http.StatusOK}, http.StatusOK
}