import * as clack from '@clack/prompts';
import type { Argv } from 'yargs';

export interface UpgradeOptions {
  check: boolean;
  yes: boolean;
}
export interface ReleaseNotes {
  body: string;
  htmlUrl: string;
  name?: string;
  publishedAt?: string;
}
export interface ChannelLookupResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}
export type InstallMethod = {
  kind: 'homebrew' | 'npm-global' | 'npx' | 'unknown';
  manualCommand?: string;
  manualInstructions?: string[];
  autoCommands?: string[][];
};
export interface UpgradeDependencies {}

const MSG =
  'Online upgrade checks are disabled in this no-telemetry fork. Please update manually from your trusted fork.';

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}
export function parseVersion(_raw: string): ParsedVersion | null {
  return null;
}
export function compareVersions(_a: ParsedVersion, _b: ParsedVersion): 'older' | 'equal' | 'newer' {
  return 'equal';
}
export function detectInstallMethodFromPaths(
  _packageName: string,
  _paths: string[],
): InstallMethod {
  return { kind: 'unknown', manualInstructions: [] };
}
export function truncateReleaseNotes(body: string, releaseUrl: string): string {
  return body || `Full release notes: ${releaseUrl}`;
}

export async function runUpgradeCommand(
  _options: UpgradeOptions,
  _deps?: Partial<UpgradeDependencies>,
): Promise<number> {
  const isTTY = process.stdout.isTTY && process.stdin.isTTY;
  if (isTTY) {
    clack.intro('XcodeBuildMCP Upgrade');
    clack.log.info(MSG);
    clack.outro('');
  } else {
    process.stdout.write(`${MSG}
`);
  }
  return 0;
}

export function registerUpgradeCommand(app: Argv): void {
  app.command(
    'upgrade',
    'Show manual upgrade guidance for this fork',
    (yargs) =>
      yargs
        .option('check', { type: 'boolean', default: false })
        .option('yes', { type: 'boolean', alias: 'y', default: false }),
    async (argv) => {
      const exitCode = await runUpgradeCommand({
        check: argv.check as boolean,
        yes: argv.yes as boolean,
      });
      if (exitCode !== 0) process.exit(exitCode);
    },
  );
}
