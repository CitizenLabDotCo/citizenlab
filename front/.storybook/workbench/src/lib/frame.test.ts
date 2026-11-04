import { applyToDocument, clear, storyUrl } from './frame';

describe('storyUrl', () => {
  it('builds the preview frame URL with the globals', () => {
    expect(
      storyUrl('components-button--primary', {
        city: 'linz',
        lang: 'nl-BE',
      })
    ).toBe(
      '../iframe.html?id=components-button--primary&viewMode=story&globals=city:linz;lang:nl-BE'
    );
  });

  it('escapes what it puts in the URL', () => {
    expect(
      storyUrl('a&b', { city: 'x;y', lang: 'en' })
    ).toContain(
      'id=a%26b&viewMode=story&globals=city:x%3By;lang:en'
    );
  });
});

describe('applyToDocument', () => {
  const root = document.documentElement;
  afterEach(() => {
    clear(document);
  });

  it('sets the overrides and removes stale ones', () => {
    root.style.setProperty('color', 'red');
    applyToDocument(document, {
      '--gv-radius-control': '20px',
      '--gv-space-3': '16px',
    });
    expect(root.style.getPropertyValue('--gv-radius-control')).toBe('20px');

    applyToDocument(document, { '--gv-space-3': '20px' });
    expect(root.style.getPropertyValue('--gv-radius-control')).toBe('');
    expect(root.style.getPropertyValue('--gv-space-3')).toBe('20px');

    clear(document);
    expect(root.style.getPropertyValue('--gv-space-3')).toBe('');
    // Not ours, left alone.
    expect(root.style.getPropertyValue('color')).toBe('red');
    root.style.removeProperty('color');
  });
});
