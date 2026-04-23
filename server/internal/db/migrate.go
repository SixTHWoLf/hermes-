package db

import (
	"embed"
	"fmt"
	"sort"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// RunMigrations runs all SQL migration files
func (db *DB) RunMigrations() error {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Sort migration files by name
	var migrations []string
	for _, entry := range entries {
		if !entry.IsDir() && entry.Name() != ".DS_Store" {
			migrations = append(migrations, entry.Name())
		}
	}
	sort.Strings(migrations)

	// Execute each migration
	for _, migration := range migrations {
		content, err := migrationsFS.ReadFile("migrations/" + migration)
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", migration, err)
		}

		_, err = db.Exec(string(content))
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", migration, err)
		}

		fmt.Printf("Applied migration: %s\n", migration)
	}

	return nil
}