import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import { configService } from '@/lib/config/service';
import { backupService } from '@/lib/config/backup';
import { HermesConfig } from '@/lib/config/types';

/**
 * POST /api/config/backup/restore - Restore from a backup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        {
          success: false,
          error: 'Backup filename is required',
        },
        { status: 400 }
      );
    }

    // Restore backup content
    const configContent = await backupService.restoreBackup(filename);

    // Parse YAML content
    const restoredConfig = yaml.load(configContent) as HermesConfig;

    // Validate restored config
    const validation = configService.validateConfig(restoredConfig);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restored configuration is invalid',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Write restored config
    await configService.writeConfig(restoredConfig);

    return NextResponse.json({
      success: true,
      message: 'Configuration restored successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore backup',
      },
      { status: 500 }
    );
  }
}
