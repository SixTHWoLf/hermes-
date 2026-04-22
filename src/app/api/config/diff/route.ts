import { NextResponse } from 'next/server';
import { configService } from '@/lib/config/service';
import { HermesConfig } from '@/lib/config/types';
import {
  defaultModelConfig,
  defaultAgentConfig,
  defaultTerminalConfig,
  defaultBrowserConfig,
  defaultDisplayConfig,
  defaultCodeExecutionConfig,
} from '@/lib/config/defaults';

interface ConfigDiff {
  field: string;
  current: unknown;
  default: unknown;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
}

interface DiffResult {
  hasChanges: boolean;
  diffs: ConfigDiff[];
  summary: {
    added: number;
    removed: number;
    changed: number;
  };
}

/**
 * GET /api/config/diff - Compare current config with defaults
 */
export async function GET() {
  try {
    const currentConfig = await configService.getConfig();
    const diffs: ConfigDiff[] = [];

    // Build default config
    const defaultConfig: HermesConfig = {
      model: defaultModelConfig,
      agent: defaultAgentConfig,
      terminal: defaultTerminalConfig,
      browser: defaultBrowserConfig,
      display: defaultDisplayConfig,
      code_execution: defaultCodeExecutionConfig,
    };

    // Compare each section
    const sections: (keyof HermesConfig)[] = [
      'model',
      'agent',
      'terminal',
      'browser',
      'display',
      'code_execution',
      'auxiliary',
      'tts',
      'stt',
      'security',
      'message_platform',
      'memory',
    ];

    for (const section of sections) {
      const currentSection = currentConfig[section];
      const defaultSection = defaultConfig[section];

      if (currentSection === undefined && defaultSection === undefined) {
        continue;
      }

      if (currentSection === undefined) {
        diffs.push({
          field: section,
          current: null,
          default: defaultSection,
          status: 'removed',
        });
      } else if (defaultSection === undefined) {
        diffs.push({
          field: section,
          current: currentSection,
          default: null,
          status: 'added',
        });
      } else {
        const sectionDiffs = compareObjects(
          currentSection as Record<string, unknown>,
          defaultSection as Record<string, unknown>,
          section
        );
        diffs.push(...sectionDiffs);
      }
    }

    const summary = {
      added: diffs.filter(d => d.status === 'added').length,
      removed: diffs.filter(d => d.status === 'removed').length,
      changed: diffs.filter(d => d.status === 'changed').length,
    };

    const result: DiffResult = {
      hasChanges: diffs.length > 0,
      diffs,
      summary,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compare configurations',
      },
      { status: 500 }
    );
  }
}

function compareObjects(
  current: Record<string, unknown>,
  defaultObj: Record<string, unknown>,
  prefix: string
): ConfigDiff[] {
  const diffs: ConfigDiff[] = [];
  const allKeys = new Set([...Object.keys(current), ...Object.keys(defaultObj)]);

  for (const key of allKeys) {
    const currentValue = current[key];
    const defaultValue = defaultObj[key];
    const fieldName = `${prefix}.${key}`;

    if (currentValue === undefined && defaultValue !== undefined) {
      diffs.push({
        field: fieldName,
        current: null,
        default: defaultValue,
        status: 'removed',
      });
    } else if (currentValue !== undefined && defaultValue === undefined) {
      diffs.push({
        field: fieldName,
        current: currentValue,
        default: null,
        status: 'added',
      });
    } else if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
      diffs.push({
        field: fieldName,
        current: currentValue,
        default: defaultValue,
        status: 'changed',
      });
    }
  }

  return diffs;
}
