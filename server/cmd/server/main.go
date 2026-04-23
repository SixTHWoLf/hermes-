package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SixTHWoLf/hermes/server/internal/db"
	"github.com/SixTHWoLf/hermes/server/internal/handlers"
	"github.com/SixTHWoLf/hermes/server/pkg/audit"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Initialize database
	database, err := db.New()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	auditRepo := audit.NewRepository(database)

	// Initialize handlers
	auditHandler := handlers.NewAuditHandler(auditRepo)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/audit", func(r chi.Router) {
		r.Get("/logs", auditHandler.ListLogs)
		r.Post("/logs", auditHandler.CreateLog)
		r.Get("/logs/{id}", auditHandler.GetLog)
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}