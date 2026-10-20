import { describe, expect, it } from 'vitest';
import { isValidTokenFormat } from './tokenFormat';

describe('isValidTokenFormat', () => {
  it('accepts header-safe tokens', () => {
    expect(isValidTokenFormat('ct1.abc-DEF_123.xyz')).toBe(true);
    expect(isValidTokenFormat('abc')).toBe(true);
  });
  it.each(['ab c', 'токен', 'ab\ncd', 'a—b', '“abc”', ''])('rejects %j', (t) => {
    expect(isValidTokenFormat(t)).toBe(false);
  });
});
