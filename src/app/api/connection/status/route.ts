import { NextRequest, NextResponse } from 'next/server';
import { connectionService } from '@/lib/connection/service';
import { PlatformType, ConnectionStateResponse } from '@/lib/connection/types';

/**
 * GET /api/connection/status - Get all platform connection statuses
 */
export async function GET() {
  try {
    const state = connectionService.getConnectionState();

    const response: ConnectionStateResponse = {
      success: true,
      data: state,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ConnectionStateResponse = {
      success: false,
      error: 'Failed to get connection status',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/connection/status - Update platform status (internal use)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, status, errorMessage } = body as {
      platform: PlatformType;
      status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'unknown';
      errorMessage?: string;
    };

    if (!platform || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: platform and status' },
        { status: 400 }
      );
    }

    connectionService.updatePlatformStatus(platform, status, errorMessage);

    return NextResponse.json({
      success: true,
      data: connectionService.getPlatformState(platform),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update connection status' },
      { status: 500 }
    );
  }
}
