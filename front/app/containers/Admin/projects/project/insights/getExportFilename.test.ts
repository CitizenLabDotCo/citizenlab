import getExportFilename from './getExportFilename';

describe('getExportFilename', () => {
  it('keeps Latin titles as lowercase dashed words', () => {
    expect(getExportFilename('Vragenlijst nieuwkomers: 2026!', 'abc')).toBe(
      'vragenlijst-nieuwkomers-2026'
    );
  });

  it('keeps titles in non-Latin scripts', () => {
    expect(getExportFilename('استبيان', 'abc')).toBe('استبيان');
    expect(getExportFilename('Опитування', 'abc')).toBe('опитування');
  });

  it('cuts long titles to 60 characters', () => {
    const title = 'Опитування '.repeat(10);

    const filename = getExportFilename(title, 'abc');

    expect(Array.from(filename)).toHaveLength(60);
    expect(filename.endsWith('-')).toBe(false);
  });

  it('falls back to the phase id when nothing usable is left', () => {
    expect(getExportFilename('🎉 !!', 'abc')).toBe('phase-abc');
    expect(getExportFilename('', 'abc')).toBe('phase-abc');
  });
});
