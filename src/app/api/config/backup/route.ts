import { NextRequest, NextResponse } from 'next/server';
import { createBackup, listBackups, restoreBackup, validateConfig } from '@/lib/config';
import { ApiResponse, BackupInfo } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { validateBeforeBackup = true } = body as { validateBeforeBackup?: boolean };

    if (validateBeforeBackup) {
      const { readConfig } = await import('@/lib/config');
      const currentConfig = readConfig();
      const validation = validateConfig(currentConfig);

      if (!validation.valid) {
        const responseData: ApiResponse = {
          success: false,
          error: `Configuration validation failed: ${validation.errors.join(', ')}. Please fix configuration before creating backup.`,
        };
        return NextResponse.json(responseData, { status: 400 });
      }
    }

    const backup = createBackup();

    const responseData: ApiResponse<BackupInfo> = {
      success: true,
      data: backup,
      message: 'Backup created successfully',
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const responseData: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create backup',
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const backups = listBackups();

    const responseData: ApiResponse<BackupInfo[]> = {
      success: true,
      data: backups,
      message: `Found ${backups.length} backup(s)`,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const responseData: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list backups',
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}
