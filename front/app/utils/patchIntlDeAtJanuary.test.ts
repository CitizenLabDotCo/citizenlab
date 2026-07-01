// Importing the module installs the global Intl patch (side effect).
import 'utils/patchIntlDeAtJanuary';

describe('patchIntlDeAtJanuary', () => {
  const jan = new Date(2026, 0, 15);
  const feb = new Date(2026, 1, 1);

  it('rewrites de-AT wide January to "Januar" via Intl.DateTimeFormat.format', () => {
    const out = new Intl.DateTimeFormat('de-AT', { month: 'long' }).format(jan);
    expect(out).toBe('Januar');
    expect(out).not.toBe('Jänner');
  });

  it('rewrites the month part in formatToParts', () => {
    const parts = new Intl.DateTimeFormat('de-AT', {
      month: 'long',
    }).formatToParts(jan);
    expect(parts.find((p) => p.type === 'month')?.value).toBe('Januar');
  });

  it('rewrites Date#toLocaleDateString for de-AT', () => {
    expect(jan.toLocaleDateString('de-AT', { month: 'long' })).toBe('Januar');
  });

  it('leaves abbreviated January, other months, and other locales untouched', () => {
    // Abbreviated form is intentionally not rewritten.
    expect(
      new Intl.DateTimeFormat('de-AT', { month: 'short' }).format(jan)
    ).toBe('Jän');
    // Other months unaffected.
    expect(
      new Intl.DateTimeFormat('de-AT', { month: 'long' }).format(feb)
    ).toBe('Februar');
    // Plain German already says "Januar"; English unaffected.
    expect(new Intl.DateTimeFormat('de', { month: 'long' }).format(jan)).toBe(
      'Januar'
    );
    expect(new Intl.DateTimeFormat('en', { month: 'long' }).format(jan)).toBe(
      'January'
    );
  });

  it('preserves the static supportedLocalesOf', () => {
    expect(Intl.DateTimeFormat.supportedLocalesOf(['de-AT'])).toContain(
      'de-AT'
    );
  });
});
