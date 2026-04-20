import { NextResponse } from 'next/server';
import { listBackups } from '@/lib/config';
import { ApiResponse, BackupInfo } from '@/lib/types';

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
