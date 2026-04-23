import { NextRequest, NextResponse } from 'next/server';
import { connectionService } from '@/lib/connection/service';
import { PlatformType, ReconnectResponse } from '@/lib/connection/types';

/**
 * POST /api/connection/reconnect - Trigger reconnection for a platform
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body as { platform: PlatformType };

    if (!platform) {
      const response: ReconnectResponse = {
        success: false,
        platform: 'unknown' as PlatformType,
        error: 'Missing required field: platform',
      };

      return NextResponse.json(response, { status: 400 });
    }

    const result = await connectionService.reconnect(platform);

    const response: ReconnectResponse = {
      success: true,
      platform,
      data: {
        reconnecting: result.reconnecting,
        attempt: result.attempt,
        nextRetryAt: result.reconnecting
          ? new Date(Date.now() + 5000).toISOString()
          : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ReconnectResponse = {
      success: false,
      platform: 'unknown' as PlatformType,
      error: 'Failed to trigger reconnection',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
