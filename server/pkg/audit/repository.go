package audit

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/SixTHWoLf/hermes/server/internal/db"
	"github.com/SixTHWoLf/hermes/server/internal/models"
)

// Repository handles audit log database operations
type Repository struct {
	db *db.DB
}

// NewRepository creates a new audit repository
func NewRepository(database *db.DB) *Repository {
	return &Repository{db: database}
}

// Create inserts a new audit log entry
func (r *Repository) Create(log *models.AuditLog) error {
	query := `
		INSERT INTO audit_logs (user_id, user_name, operation, resource_type, resource_id, old_value, new_value, change_summary, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at
	`

	err := r.db.QueryRow(
		query,
		log.UserID,
		log.UserName,
		log.Operation,
		log.ResourceType,
		log.ResourceID,
		nullString(log.OldValue),
		nullString(log.NewValue),
		log.ChangeSummary,
		log.CreatedAt,
	).Scan(&log.ID, &log.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}

	return nil
}

// List retrieves audit logs with filtering and pagination
func (r *Repository) List(filter models.AuditLogFilter) (*models.AuditLogListResponse, error) {
	// Build WHERE clause
	var conditions []string
	var args []interface{}
	argNum := 1

	if filter.UserID != "" {
		conditions = append(conditions, fmt.Sprintf("user_id = $%d", argNum))
		args = append(args, filter.UserID)
		argNum++
	}

	if filter.Operation != "" {
		conditions = append(conditions, fmt.Sprintf("operation = $%d", argNum))
		args = append(args, filter.Operation)
		argNum++
	}

	if filter.ResourceType != "" {
		conditions = append(conditions, fmt.Sprintf("resource_type = $%d", argNum))
		args = append(args, filter.ResourceType)
		argNum++
	}

	if filter.StartTime != nil {
		conditions = append(conditions, fmt.Sprintf("created_at >= $%d", argNum))
		args = append(args, *filter.StartTime)
		argNum++
	}

	if filter.EndTime != nil {
		conditions = append(conditions, fmt.Sprintf("created_at <= $%d", argNum))
		args = append(args, *filter.EndTime)
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM audit_logs %s", whereClause)
	var total int64
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count audit logs: %w", err)
	}

	// Set default pagination
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 {
		filter.PageSize = 20
	}
	if filter.PageSize > 100 {
		filter.PageSize = 100
	}

	// Calculate offset
	offset := (filter.Page - 1) * filter.PageSize

	// Get total pages
	totalPages := int(total) / filter.PageSize
	if int(total)%filter.PageSize > 0 {
		totalPages++
	}

	// Get paginated results
	selectQuery := fmt.Sprintf(`
		SELECT id, user_id, user_name, operation, resource_type, resource_id, old_value, new_value, change_summary, created_at
		FROM audit_logs
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argNum, argNum+1)

	args = append(args, filter.PageSize, offset)

	rows, err := r.db.Query(selectQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs: %w", err)
	}
	defer rows.Close()

	var logs []models.AuditLog
	for rows.Next() {
		var log models.AuditLog
		var oldValue, newValue sql.NullString

		err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.UserName,
			&log.Operation,
			&log.ResourceType,
			&log.ResourceID,
			&oldValue,
			&newValue,
			&log.ChangeSummary,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan audit log: %w", err)
		}

		if oldValue.Valid {
			log.OldValue = oldValue.String
		}
		if newValue.Valid {
			log.NewValue = newValue.String
		}

		logs = append(logs, log)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating audit logs: %w", err)
	}

	return &models.AuditLogListResponse{
		Data:       logs,
		Total:      total,
		Page:       filter.Page,
		PageSize:   filter.PageSize,
		TotalPages: totalPages,
	}, nil
}

// GetByID retrieves a single audit log by ID
func (r *Repository) GetByID(id string) (*models.AuditLog, error) {
	query := `
		SELECT id, user_id, user_name, operation, resource_type, resource_id, old_value, new_value, change_summary, created_at
		FROM audit_logs
		WHERE id = $1
	`

	var log models.AuditLog
	var oldValue, newValue sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&log.ID,
		&log.UserID,
		&log.UserName,
		&log.Operation,
		&log.ResourceType,
		&log.ResourceID,
		&oldValue,
		&newValue,
		&log.ChangeSummary,
		&log.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get audit log: %w", err)
	}

	if oldValue.Valid {
		log.OldValue = oldValue.String
	}
	if newValue.Valid {
		log.NewValue = newValue.String
	}

	return &log, nil
}

func nullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// RecordChange is a helper to record a configuration change
func (r *Repository) RecordChange(userID, userName string, operation models.AuditLogType, resourceType, resourceID, oldValue, newValue, changeSummary string) error {
	log := &models.AuditLog{
		UserID:        userID,
		UserName:      userName,
		Operation:     operation,
		ResourceType:  resourceType,
		ResourceID:    resourceID,
		OldValue:      oldValue,
		NewValue:      newValue,
		ChangeSummary: changeSummary,
		CreatedAt:     time.Now(),
	}
	return r.Create(log)
}