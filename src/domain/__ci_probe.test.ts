import { describe, expect, it } from 'vitest';

describe('ci probe', () => {
  it('fails on purpose', () => {
    expect(true).toBe(false);
  });
});
