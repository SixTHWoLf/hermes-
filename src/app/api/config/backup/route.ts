import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import { configService } from '@/lib/config/service';
import { backupService } from '@/lib/config/backup';

/**
 * POST /api/config/backup - Create a backup
 */
export async function POST(request: NextRequest) {
  try {
    // Get current config
    const config = await configService.getConfig();
    const configContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    // Create backup
    const backupInfo = await backupService.createBackup(configContent);

    return NextResponse.json({
      success: true,
      data: backupInfo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create backup',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/config/backup/list - List all backups
 */
export async function GET() {
  try {
    const backups = await backupService.listBackups();

    return NextResponse.json({
      success: true,
      data: backups,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list backups',
      },
      { status: 500 }
    );
  }
}
