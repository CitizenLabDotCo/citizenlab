import type { TokenMeta } from './data';
import { applyToDocument, clear, readComputedTokens, storyUrl } from './frame';

const token = (name: string, category: string, value: string): TokenMeta => ({
  name,
  category,
  tier: 1,
  values: { today: value, redesign: value },
  legacy: [],
});

describe('storyUrl', () => {
  it('builds the preview frame URL with the globals', () => {
    expect(
      storyUrl('components-button--primary', {
        mode: 'redesign',
        city: 'blue',
        lang: 'nl-BE',
      })
    ).toBe(
      '../iframe.html?id=components-button--primary&viewMode=story&globals=mode:redesign;city:blue;lang:nl-BE'
    );
  });

  it('escapes what it puts in the URL', () => {
    expect(
      storyUrl('a&b', { mode: 'today', city: 'x;y', lang: 'en' })
    ).toContain(
      'id=a%26b&viewMode=story&globals=mode:today;city:x%3By;lang:en'
    );
  });
});

describe('applyToDocument', () => {
  const root = document.documentElement;
  afterEach(() => {
    clear(document);
    root.removeAttribute('data-gv-mode');
  });

  it('sets the overrides and the mode, and removes stale ones', () => {
    root.style.setProperty('color', 'red');
    applyToDocument(
      document,
      { '--gv-radius-control': '20px', '--gv-space-3': '16px' },
      'redesign'
    );
    expect(root.style.getPropertyValue('--gv-radius-control')).toBe('20px');
    expect(root.getAttribute('data-gv-mode')).toBe('redesign');

    applyToDocument(document, { '--gv-space-3': '20px' }, 'today');
    expect(root.style.getPropertyValue('--gv-radius-control')).toBe('');
    expect(root.style.getPropertyValue('--gv-space-3')).toBe('20px');
    expect(root.hasAttribute('data-gv-mode')).toBe(false);

    clear(document);
    expect(root.style.getPropertyValue('--gv-space-3')).toBe('');
    // Not ours, left alone.
    expect(root.style.getPropertyValue('color')).toBe('red');
    root.style.removeProperty('color');
  });

  it('leaves the mode alone when none is given', () => {
    root.setAttribute('data-gv-mode', 'redesign');
    applyToDocument(document, {});
    expect(root.getAttribute('data-gv-mode')).toBe('redesign');
  });
});

describe('readComputedTokens', () => {
  it('marks a token named by a rule on the story as linked', () => {
    const style = document.createElement('style');
    style.textContent = `
      .btn { border-radius: var(--gv-radius-2, 3px); }
      .other { padding: var(--gv-space-4); }
      @media (min-width: 1px) { .btn:hover { color: var(--gv-grey-800); } }
    `;
    document.head.appendChild(style);
    document.body.innerHTML =
      '<div id="storybook-root"><button class="btn">x</button></div>';

    const result = readComputedTokens(document, [
      token('--gv-radius-2', 'radius', '8px'),
      token('--gv-space-4', 'space', '16px'),
      token('--gv-grey-800', 'color', '#333333'),
    ]);
    expect(result).toEqual([
      { name: '--gv-radius-2', matches: 'linked' },
      { name: '--gv-space-4', matches: 'none' },
      { name: '--gv-grey-800', matches: 'linked' },
    ]);
    style.remove();
    document.body.innerHTML = '';
  });
});
