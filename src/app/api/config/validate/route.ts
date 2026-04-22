import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/lib/config/service';
import { HermesConfig } from '@/lib/config/types';

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * POST /api/config/validate - Validate configuration with detailed errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body.config as HermesConfig;

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration is required',
        },
        { status: 400 }
      );
    }

    // Run validation
    const result = configService.validateConfig(config);
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Convert errors to detailed format
    if (result.errors) {
      for (const error of result.errors) {
        errors.push({
          field: extractFieldFromError(error),
          message: error,
          code: extractCodeFromError(error),
        });
      }
    }

    // Add warnings for potentially problematic configs
    warnings.push(...getWarnings(config));

    const validationResult: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
    };

    return NextResponse.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
      },
      { status: 500 }
    );
  }
}

function extractFieldFromError(error: string): string {
  // Extract field name from error message like "Invalid provider: openai"
  const match = error.match(/^(?:Invalid |)([^:]+)/);
  return match ? match[1] : 'unknown';
}

function extractCodeFromError(error: string): string {
  if (error.includes('must be')) return 'INVALID_VALUE';
  if (error.includes('Invalid')) return 'INVALID_ENUM';
  if (error.includes('format')) return 'INVALID_FORMAT';
  return 'VALIDATION_ERROR';
}

function getWarnings(config: HermesConfig): string[] {
  const warnings: string[] = [];

  // Warn about missing recommended fields
  if (config.model && !config.model.api_key) {
    warnings.push('model.api_key is not set - some providers may not work');
  }

  // Warn about potentially insecure settings
  if (config.terminal && config.terminal.workdir === '/') {
    warnings.push('terminal.workdir is set to root - consider using a safer path');
  }

  // Warn about long timeouts
  if (config.terminal?.timeout && config.terminal.timeout > 3600) {
    warnings.push('terminal.timeout is very large (>1 hour) - may cause issues');
  }

  return warnings;
}
