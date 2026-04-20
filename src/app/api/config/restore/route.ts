import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup, validateConfig } from '@/lib/config';
import { maskSensitiveFields } from '@/lib/config';
import { ApiResponse, HermesConfig } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { backupId } = body as { backupId: string };

    if (!backupId) {
      const responseData: ApiResponse = {
        success: false,
        error: 'backupId is required',
      };
      return NextResponse.json(responseData, { status: 400 });
    }

    try {
      const config = restoreBackup(backupId);
      const maskedConfig = maskSensitiveFields(config);

      const responseData: ApiResponse<HermesConfig> = {
        success: true,
        data: maskedConfig,
        message: 'Configuration restored successfully',
      };

      return NextResponse.json(responseData);
    } catch (restoreError) {
      const responseData: ApiResponse = {
        success: false,
        error: restoreError instanceof Error ? restoreError.message : 'Failed to restore backup',
      };
      return NextResponse.json(responseData, { status: 400 });
    }
  } catch (error) {
    const responseData: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process restore request',
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}
