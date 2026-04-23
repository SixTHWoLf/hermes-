-- Migration: Create audit_logs table
-- Description: Stores audit trail for all configuration changes

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Comment on table
COMMENT ON TABLE audit_logs IS 'Stores audit trail for all configuration changes in Hermes Console';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who made the change';
COMMENT ON COLUMN audit_logs.user_name IS 'Name of the user who made the change';
COMMENT ON COLUMN audit_logs.operation IS 'Type of operation: create, update, or delete';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource changed (e.g., model_config, agent_config)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the changed resource';
COMMENT ON COLUMN audit_logs.old_value IS 'JSON representation of the old value before change';
COMMENT ON COLUMN audit_logs.new_value IS 'JSON representation of the new value after change';
COMMENT ON COLUMN audit_logs.change_summary IS 'Human-readable summary of the change';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the change was made';