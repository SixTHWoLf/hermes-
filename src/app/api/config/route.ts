import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig, maskSensitiveFields, validateConfig } from '@/lib/config';
import { encrypt, decrypt, isEncrypted } from '@/lib/crypto';
import { ApiResponse, HermesConfig } from '@/lib/types';

export async function GET(): Promise<NextResponse> {
  try {
    const config = readConfig();
    const maskedConfig = maskSensitiveFields(config);

    const responseData: ApiResponse<HermesConfig> = {
      success: true,
      data: maskedConfig,
      message: 'Configuration retrieved successfully',
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const responseData: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read configuration',
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as HermesConfig;

    const validation = validateConfig(body);
    if (!validation.valid) {
      const responseData: ApiResponse = {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
      return NextResponse.json(responseData, { status: 400 });
    }

    const currentConfig = readConfig();

    if (body.apiKey && !isEncrypted(body.apiKey)) {
      body.apiKey = encrypt(body.apiKey);
    }
    if (body.apiSecret && !isEncrypted(body.apiSecret)) {
      body.apiSecret = encrypt(body.apiSecret);
    }

    const updatedConfig: HermesConfig = {
      ...currentConfig,
      ...body,
    };

    writeConfig(updatedConfig);

    const maskedConfig = maskSensitiveFields(updatedConfig);
    const responseData: ApiResponse<HermesConfig> = {
      success: true,
      data: maskedConfig,
      message: 'Configuration updated successfully',
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const responseData: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update configuration',
    };
    return NextResponse.json(responseData, { status: 500 });
  }
}
