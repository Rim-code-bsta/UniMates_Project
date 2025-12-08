import { describe, it, expect } from 'vitest';
import { calculateMatchScore } from './utils';

describe('calculateMatchScore', () => {
  it('returns correct score based on shared interests', () => {
    const a = ['Coding', 'Basketball', 'Music'];
    const b = ['Music', 'Cooking', 'Coding'];

    const score = calculateMatchScore(a, b);

    expect(score).toBe(20); // 2 shared interests * 10 = 20
  });
});
