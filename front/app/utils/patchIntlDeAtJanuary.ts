/**
 * Overrides the Austrian German (de-AT) January month name — "Jänner" (wide)
 * and "Jän" (short) — with "Januar" / "Jan" wherever the platform's native
 * `Intl` API produces it. Counterpart to the date-fns (`i18n/de-AT.ts`) and
 * moment (`patchMomentDeAtJanuary.ts`) overrides.
 *
 * react-intl's `formatDate` / `<FormattedDate>` and any raw `Intl` or
 * `Date#toLocale*` call ultimately go through the native methods patched below,
 * so we post-process their output — but only for the de-AT locale, leaving every
 * other locale's formatting untouched.
 *
 * Imported for side effects at the very top of `root.tsx` so it runs before the
 * first date is formatted. Idempotent per realm.
 */

const localeIsDeAt = (locale: string | undefined): boolean =>
  !!locale && locale.toLowerCase().startsWith('de-at');

// Rewrite the wide form first ("Jänner" -> "Januar"), then the short form
// ("Jän" -> "Jan"): "Jän" is a prefix of "Jänner", so the order matters.
const januarize = (value: string): string =>
  value.split('Jänner').join('Januar').split('Jän').join('Jan');

const januarizeMonthParts = (
  parts: Intl.DateTimeFormatPart[]
): Intl.DateTimeFormatPart[] =>
  parts.map((part) =>
    part.type === 'month' ? { ...part, value: januarize(part.value) } : part
  );

const dtfProto = Intl.DateTimeFormat.prototype;

// `Intl.DateTimeFormat.prototype.format` is an accessor whose getter returns a
// bound formatter. For de-AT, return a formatter that januarizes; every other
// locale gets the original, untouched.
const wrapFormatGetter = (): void => {
  const descriptor = Object.getOwnPropertyDescriptor(dtfProto, 'format');
  const originalGet = descriptor?.get;
  if (!originalGet) return;
  Object.defineProperty(dtfProto, 'format', {
    ...descriptor,
    get(this: Intl.DateTimeFormat) {
      const format = originalGet.call(this) as Intl.DateTimeFormat['format'];
      if (!localeIsDeAt(this.resolvedOptions().locale)) return format;
      return (date?: Date | number) => januarize(format(date));
    },
  });
};

// formatToParts is a plain method; januarize its month part for de-AT instances.
const wrapFormatToParts = (): void => {
  const original = dtfProto.formatToParts;
  dtfProto.formatToParts = function (
    this: Intl.DateTimeFormat,
    date?: Date | number
  ) {
    const parts = original.call(this, date);
    return localeIsDeAt(this.resolvedOptions().locale)
      ? januarizeMonthParts(parts)
      : parts;
  };
};

// Date#toLocaleDateString / #toLocaleString use the %DateTimeFormat% intrinsic
// directly (not the prototype above), so wrap them too. There's no formatter
// instance, so gate on the requested `locales` argument.
type ToLocaleFn = (
  locales?: string | string[],
  options?: Intl.DateTimeFormatOptions
) => string;

const wrapDateMethod = (
  name: 'toLocaleDateString' | 'toLocaleString'
): void => {
  const holder = Date.prototype as unknown as Record<string, ToLocaleFn>;
  const original = holder[name];
  holder[name] = function (this: Date, locales, options) {
    const result = original.call(this, locales, options);
    const requested = Array.isArray(locales)
      ? locales
      : locales
      ? [locales]
      : [];
    return requested.some(localeIsDeAt) ? januarize(result) : result;
  };
};

const MARKER = '__deAtJanuarPatched';

// Guard so re-importing within the same realm (e.g. Jest test files sharing the
// global Intl) doesn't wrap twice.
if (!Object.prototype.hasOwnProperty.call(dtfProto, MARKER)) {
  Object.defineProperty(dtfProto, MARKER, { value: true });

  wrapFormatGetter();
  wrapFormatToParts();
  wrapDateMethod('toLocaleDateString');
  wrapDateMethod('toLocaleString');
}
