export type SentryRuntimeMode = 'mcp' | 'cli-daemon' | 'cli';
export type SentryToolRuntime = 'cli' | 'daemon' | 'mcp';
export type SentryToolTransport = 'direct' | 'daemon' | 'xcode-ide-daemon';
export type SentryToolInvocationOutcome = 'completed' | 'infra_error';
export type SentryDaemonLifecycleEvent = 'start' | 'shutdown' | 'crash';
export type SentryMcpLifecycleEvent = 'start' | 'shutdown' | 'crash';
export interface SentryRuntimeContext {
  mode: SentryRuntimeMode;
  xcodeAvailable?: boolean;
  enabledWorkflows?: string[];
  disableSessionDefaults?: boolean;
  disableXcodeAutoSync?: boolean;
  incrementalBuildsEnabled?: boolean;
  debugEnabled?: boolean;
  uiDebuggerGuardMode?: string;
  xcodeIdeWorkflowEnabled?: boolean;
  axeAvailable?: boolean;
  axeSource?: 'env' | 'bundled' | 'path' | 'unavailable';
  axeVersion?: string;
  xcodeDeveloperDir?: string;
  xcodebuildPath?: string;
  xcodemakeAvailable?: boolean;
  xcodemakeEnabled?: boolean;
  xcodeVersion?: string;
  xcodeBuildVersion?: string;
}
export interface McpShutdownSummaryEvent {
  reason: string;
  phase: string;
  exitCode: number;
  transportDisconnected: boolean;
  triggerError?: string;
  shutdownStepFailureCount: number;
  cleanupDiagnosticCount?: number;
  shutdownDurationMs: number;
  snapshot: Record<string, unknown>;
  steps: Array<Record<string, unknown>>;
}
export type FlushSentryOutcome = 'skipped' | 'flushed' | 'timed_out' | 'failed';
export function __redactEventForTests<T>(event: T): T {
  return structuredClone(event);
}
export function __redactLogForTests<T>(log: T): T {
  return structuredClone(log);
}
export function __parseXcodeVersionForTests(_output: string): {
  version?: string;
  buildVersion?: string;
} {
  return {};
}
export function initSentry(_context?: Pick<SentryRuntimeContext, 'mode'>): void {}
export function enrichSentryContext(): void {}
export function setSentryRuntimeContext(_context: SentryRuntimeContext): void {}
export async function flushAndCloseSentry(_timeoutMs = 2000): Promise<void> {}
export async function flushSentry(_timeoutMs = 2000): Promise<FlushSentryOutcome> {
  return 'skipped';
}
export function captureMcpShutdownSummary(_summary: McpShutdownSummaryEvent): void {}
export function recordToolInvocationMetric(_metric: {
  toolName: string;
  runtime: SentryToolRuntime;
  transport: SentryToolTransport;
  outcome: SentryToolInvocationOutcome;
  durationMs: number;
}): void {}
export function recordInternalErrorMetric(_metric: {
  component: string;
  runtime: SentryToolRuntime;
  errorKind: string;
}): void {}
export function recordDaemonLifecycleMetric(_event: SentryDaemonLifecycleEvent): void {}
export function recordBootstrapDurationMetric(
  _runtime: SentryRuntimeMode,
  _durationMs: number,
): void {}
export function recordDaemonGaugeMetric(
  _metricName: 'inflight_requests' | 'active_sessions' | 'idle_timeout_ms',
  _value: number,
): void {}
export function recordMcpLifecycleMetric(_metric: {
  event: SentryMcpLifecycleEvent;
  phase: string;
  reason?: string;
  uptimeMs: number;
  rssBytes: number;
  matchingMcpProcessCount?: number | null;
  activeOperationCount: number;
  watcherRunning: boolean;
}): void {}
export function recordMcpLifecycleAnomalyMetric(_metric: {
  kind: string;
  phase: string;
  reason?: string;
}): void {}
export async function getXcodeVersionMetadata(
  runCommand: (command: string[]) => Promise<{ success: boolean; output: string }>,
): Promise<{
  version?: string;
  buildVersion?: string;
  developerDir?: string;
  xcodebuildPath?: string;
}> {
  const m: any = {};
  try {
    const r = await runCommand(['xcodebuild', '-version']);
    if (r.success) {
      const l = r.output.split('\n');
      m.version = l[0]?.replace(/^Xcode\s+/, '').trim() || undefined;
      m.buildVersion = l[1]?.replace(/^Build version\s+/, '').trim() || undefined;
    }
  } catch {}
  try {
    const r = await runCommand(['xcode-select', '-p']);
    if (r.success) m.developerDir = r.output.trim();
  } catch {}
  try {
    const r = await runCommand(['xcrun', '--find', 'xcodebuild']);
    if (r.success) m.xcodebuildPath = r.output.trim();
  } catch {}
  return m;
}
export async function getAxeVersionMetadata(
  runCommand: (command: string[]) => Promise<{ success: boolean; output: string }>,
  axePath: string | undefined,
): Promise<string | undefined> {
  if (!axePath) return undefined;
  try {
    const r = await runCommand([axePath, '--version']);
    if (!r.success) return undefined;
    return r.output.trim().split('\n')[0]?.trim() || undefined;
  } catch {
    return undefined;
  }
}
