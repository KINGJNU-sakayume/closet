import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

// 지시서 '디자인 원칙과 토큰' 표의 값
const colors: Record<string, string> = {
  '--bg': '#FFFFFF',
  '--bg-subtle': '#FAFAF8',
  '--stage': '#F7F6F3',
  '--tile': '#F0EFEB',
  '--line': '#E6E5E1',
  '--line-input': '#8A8880',
  '--text': '#1A1A18',
  '--text-2': '#3D3C38',
  '--muted': '#5F5E5A',
  '--accent': '#2E5E4E',
};

describe('tokens.css', () => {
  it.each(Object.entries(colors))('%s = %s', (name, value) => {
    expect(css).toContain(`${name}: ${value};`);
  });
});
