import { NextRequest, NextResponse } from 'next/server';
import { configService } from '@/lib/config/service';
import { configTemplates, ConfigTemplate } from '@/lib/config/defaults';
import { HermesConfig } from '@/lib/config/types';

/**
 * GET /api/config/templates - List all available templates
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: configTemplates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list templates',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config/templates - Apply a template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template_id, merge = true } = body as {
      template_id: string;
      merge?: boolean;
    };

    if (!template_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'template_id is required',
        },
        { status: 400 }
      );
    }

    // Find the template
    const template = configTemplates.find(t => t.id === template_id);
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: `Template not found: ${template_id}`,
        },
        { status: 404 }
      );
    }

    // Get current config
    const currentConfig = await configService.getConfig();

    // Merge or replace
    let newConfig: HermesConfig;
    if (merge) {
      newConfig = {
        ...currentConfig,
        ...template.config,
      };
    } else {
      newConfig = template.config as HermesConfig;
    }

    // Validate before applying
    const validation = configService.validateConfig(newConfig);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Write the new config
    await configService.writeConfig(newConfig);

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" applied successfully`,
      data: {
        template_id,
        template_name: template.name,
        merged: merge,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to apply template',
      },
      { status: 500 }
    );
  }
}
