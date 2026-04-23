package audit

import (
	"testing"
)

func TestChangeDetector_ChangeSummary_Create(t *testing.T) {
	cd := NewChangeDetector()

	summary := cd.ChangeSummary("model_config", "config-123", nil, map[string]string{"name": "test"}, OperationCreate)

	if summary == "" {
		t.Error("expected non-empty summary")
	}
	if summary != "Created model_config config-123" {
		t.Errorf("unexpected summary: %s", summary)
	}
}

func TestChangeDetector_ChangeSummary_Update(t *testing.T) {
	cd := NewChangeDetector()

	tests := []struct {
		name     string
		oldVal   interface{}
		newVal   interface{}
		expected string
	}{
		{
			name:     "simple field change",
			oldVal:   map[string]string{"name": "old-name", "value": "same"},
			newVal:   map[string]string{"name": "new-name", "value": "same"},
			expected: "Updated model_config config-123: changed name from 'old-name' to 'new-name'",
		},
		{
			name:     "added field",
			oldVal:   map[string]string{"name": "test"},
			newVal:   map[string]string{"name": "test", "description": "new field"},
			expected: "Updated model_config config-123: added description",
		},
		{
			name:     "removed field",
			oldVal:   map[string]string{"name": "test", "description": "old field"},
			newVal:   map[string]string{"name": "test"},
			expected: "Updated model_config config-123: removed description",
		},
		{
			name:     "no changes",
			oldVal:   map[string]string{"name": "same", "value": "same"},
			newVal:   map[string]string{"name": "same", "value": "same"},
			expected: "Updated model_config config-123",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			summary := cd.ChangeSummary("model_config", "config-123", tt.oldVal, tt.newVal, OperationUpdate)
			if summary != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, summary)
			}
		})
	}
}

func TestChangeDetector_ChangeSummary_Delete(t *testing.T) {
	cd := NewChangeDetector()

	summary := cd.ChangeSummary("model_config", "config-123", map[string]string{"name": "test"}, nil, OperationDelete)

	if summary == "" {
		t.Error("expected non-empty summary")
	}
	if summary != "Deleted model_config config-123" {
		t.Errorf("unexpected summary: %s", summary)
	}
}

func TestToStringMap(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected map[string]string
	}{
		{
			name:     "nil input",
			input:    nil,
			expected: map[string]string{},
		},
		{
			name:     "map with string values",
			input:    map[string]string{"key1": "value1", "key2": "value2"},
			expected: map[string]string{"key1": "value1", "key2": "value2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := toStringMap(tt.input)
			for key, val := range tt.expected {
				if result[key] != val {
					t.Errorf("expected %s=%s, got %s=%s", key, val, key, result[key])
				}
			}
		})
	}
}

func TestToString(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected string
	}{
		{"nil", nil, ""},
		{"string", "test", "test"},
		{"bytes", []byte("test"), "test"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := toString(tt.input)
			if result != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, result)
			}
		})
	}
}

func TestOperationTypes(t *testing.T) {
	if OperationCreate != "create" {
		t.Errorf("expected 'create', got %s", OperationCreate)
	}
	if OperationUpdate != "update" {
		t.Errorf("expected 'update', got %s", OperationUpdate)
	}
	if OperationDelete != "delete" {
		t.Errorf("expected 'delete', got %s", OperationDelete)
	}
}