import { NextRequest, NextResponse } from 'next/server';
import { connectionService } from '@/lib/connection/service';
import { PlatformType, HealthCheckResponse } from '@/lib/connection/types';

/**
 * GET /api/connection/health - Get health status for all or specific platform
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as PlatformType | null;

    if (platform) {
      const health = await connectionService.checkPlatformHealth(platform);

      const response: HealthCheckResponse = {
        success: true,
        data: health,
      };

      return NextResponse.json(response);
    }

    // Get health for all platforms
    const platforms: PlatformType[] = ['discord', 'telegram', 'slack', 'whatsapp', 'qq_bot'];
    const healthResults = await Promise.all(
      platforms.map(async (p) => {
        const health = await connectionService.checkPlatformHealth(p);
        return health;
      })
    );

    return NextResponse.json({
      success: true,
      data: healthResults,
    });
  } catch (error) {
    const response: HealthCheckResponse = {
      success: false,
      error: 'Failed to check health status',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
