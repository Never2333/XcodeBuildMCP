import { describe, expect, it } from 'vitest';
import {
  __parseXcodeVersionForTests,
  __redactEventForTests,
  __redactLogForTests,
} from '../sentry.ts';

describe('sentry compatibility no-op', () => {
  it('keeps compatibility helpers callable', () => {
    const event = { message: 'test' };
    expect(__redactEventForTests(event)).toEqual(event);
    const log = { level: 'info', message: 'test' };
    expect(__redactLogForTests(log)).toEqual(log);
  });

  it('returns empty parsed metadata in no-op mode', () => {
    expect(__parseXcodeVersionForTests('Xcode 16.3\nBuild version 16E123\n')).toEqual({});
  });
});
