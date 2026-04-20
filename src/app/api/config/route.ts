import { NextRequest, NextResponse } from 'next/server';
import * as yaml from 'js-yaml';
import { configService } from '@/lib/config/service';
import { maskSensitiveData } from '@/lib/security/masking';
import { HermesConfig } from '@/lib/config/types';

/**
 * GET /api/config - Get the full configuration
 */
export async function GET() {
  try {
    const config = await configService.getConfig();
    const maskedConfig = maskSensitiveData(config);

    return NextResponse.json({
      success: true,
      data: maskedConfig,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read configuration',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config - Update configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates = body as Partial<HermesConfig>;

    // Validate configuration
    const validation = configService.validateConfig(updates as HermesConfig);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update config
    const newConfig = await configService.updateConfig(updates);
    const maskedConfig = maskSensitiveData(newConfig);

    return NextResponse.json({
      success: true,
      data: maskedConfig,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration',
      },
      { status: 500 }
    );
  }
}
