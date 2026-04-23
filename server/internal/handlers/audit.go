package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/SixTHWoLf/hermes/server/internal/models"
	"github.com/SixTHWoLf/hermes/server/pkg/audit"
	"github.com/go-chi/chi/v5"
)

// AuditHandler handles audit log HTTP requests
type AuditHandler struct {
	repo *audit.Repository
}

// NewAuditHandler creates a new audit handler
func NewAuditHandler(repo *audit.Repository) *AuditHandler {
	return &AuditHandler{repo: repo}
}

// ListLogs handles GET /api/audit/logs
// Query params: user_id, operation, resource_type, start_time, end_time, page, page_size
func (h *AuditHandler) ListLogs(w http.ResponseWriter, r *http.Request) {
	filter := models.AuditLogFilter{
		UserID:       r.URL.Query().Get("user_id"),
		Operation:    models.AuditLogType(r.URL.Query().Get("operation")),
		ResourceType: r.URL.Query().Get("resource_type"),
	}

	// Parse pagination
	if page := r.URL.Query().Get("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			filter.Page = p
		}
	}
	if pageSize := r.URL.Query().Get("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			filter.PageSize = ps
		}
	}

	// Parse time range
	if startTime := r.URL.Query().Get("start_time"); startTime != "" {
		if t, err := time.Parse(time.RFC3339, startTime); err == nil {
			filter.StartTime = &t
		}
	}
	if endTime := r.URL.Query().Get("end_time"); endTime != "" {
		if t, err := time.Parse(time.RFC3339, endTime); err == nil {
			filter.EndTime = &t
		}
	}

	result, err := h.repo.List(filter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to retrieve audit logs")
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// GetLog handles GET /api/audit/logs/{id}
func (h *AuditHandler) GetLog(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "Log ID is required")
		return
	}

	log, err := h.repo.GetByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to retrieve audit log")
		return
	}
	if log == nil {
		writeError(w, http.StatusNotFound, "Audit log not found")
		return
	}

	writeJSON(w, http.StatusOK, log)
}

// CreateLog handles POST /api/audit/logs (for testing/manual entry)
func (h *AuditHandler) CreateLog(w http.ResponseWriter, r *http.Request) {
	var req models.AuditLog
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.UserID == "" || req.Operation == "" || req.ResourceType == "" || req.ChangeSummary == "" {
		writeError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	if err := h.repo.Create(&req); err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create audit log")
		return
	}

	writeJSON(w, http.StatusCreated, req)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}