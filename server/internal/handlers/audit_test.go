package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteJSON(t *testing.T) {
	tests := []struct {
		name       string
		status     int
		data       interface{}
		wantHeader bool
	}{
		{
			name:       "success response",
			status:     http.StatusOK,
			data:       map[string]string{"message": "ok"},
			wantHeader: true,
		},
		{
			name:       "error response",
			status:     http.StatusNotFound,
			data:       map[string]string{"error": "not found"},
			wantHeader: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			writeJSON(w, tt.status, tt.data)

			if w.Code != tt.status {
				t.Errorf("expected status %d, got %d", tt.status, w.Code)
			}

			if tt.wantHeader {
				contentType := w.Header().Get("Content-Type")
				if contentType != "application/json" {
					t.Errorf("expected Content-Type 'application/json', got %s", contentType)
				}
			}
		})
	}
}

func TestWriteError(t *testing.T) {
	w := httptest.NewRecorder()
	writeError(w, http.StatusBadRequest, "test error")

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	var response map[string]string
	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if response["error"] != "test error" {
		t.Errorf("expected error 'test error', got %s", response["error"])
	}
}

func TestWriteJSON_DecodesCorrectly(t *testing.T) {
	data := struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}{
		ID:   "123",
		Name: "Test",
	}

	w := httptest.NewRecorder()
	writeJSON(w, http.StatusOK, data)

	var result map[string]string
	if err := json.NewDecoder(w.Body).Decode(&result); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if result["id"] != "123" {
		t.Errorf("expected id '123', got %s", result["id"])
	}
	if result["name"] != "Test" {
		t.Errorf("expected name 'Test', got %s", result["name"])
	}
}