package audit

import (
	"context"
	"encoding/json"
	"reflect"
	"strings"
)

// ChangeDetector detects changes between old and new values
type ChangeDetector struct{}

// NewChangeDetector creates a new change detector
func NewChangeDetector() *ChangeDetector {
	return &ChangeDetector{}
}

// ChangeSummary generates a human-readable summary of changes
func (cd *ChangeDetector) ChangeSummary(resourceType, resourceID string, oldVal, newVal interface{}, operation OperationType) string {
	var changes []string

	switch operation {
	case OperationCreate:
		return "Created " + resourceType + " " + resourceID
	case OperationDelete:
		return "Deleted " + resourceType + " " + resourceID
	case OperationUpdate:
		oldMap, newMap := toStringMap(oldVal), toStringMap(newVal)
		for key, newVal := range newMap {
			oldVal, exists := oldMap[key]
			if !exists {
				changes = append(changes, "added "+key)
			} else if oldVal != newVal {
				changes = append(changes, "changed "+key+" from '"+oldVal+"' to '"+newVal+"'")
			}
		}
		for key := range oldMap {
			if _, exists := newMap[key]; !exists {
				changes = append(changes, "removed "+key)
			}
		}
	}

	if len(changes) == 0 {
		return "Updated " + resourceType + " " + resourceID
	}

	return "Updated " + resourceType + " " + resourceID + ": " + strings.Join(changes, ", ")
}

// OperationType represents the type of operation
type OperationType string

const (
	OperationCreate OperationType = "create"
	OperationUpdate OperationType = "update"
	OperationDelete OperationType = "delete"
)

// toStringMap converts an interface to a map[string]string
func toStringMap(v interface{}) map[string]string {
	result := make(map[string]string)
	if v == nil {
		return result
	}

	val := reflect.ValueOf(v)
	if val.Kind() == reflect.Map {
		for _, key := range val.MapKeys() {
			result[key.String()] = toString(val.MapIndex(key).Interface())
		}
	}
	return result
}

func toString(v interface{}) string {
	if v == nil {
		return ""
	}
	switch val := v.(type) {
	case string:
		return val
	case []byte:
		return string(val)
	default:
		b, _ := json.Marshal(val)
		return string(b)
	}
}

// ContextKey is a type for context keys
type ContextKey string

const (
	// UserIDKey is the context key for user ID
	UserIDKey ContextKey = "user_id"
	// UserNameKey is the context key for user name
	UserNameKey ContextKey = "user_name"
)

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(ctx context.Context) string {
	if userID, ok := ctx.Value(UserIDKey).(string); ok {
		return userID
	}
	return "system"
}

// GetUserNameFromContext extracts user name from context
func GetUserNameFromContext(ctx context.Context) string {
	if userName, ok := ctx.Value(UserNameKey).(string); ok {
		return userName
	}
	return "system"
}