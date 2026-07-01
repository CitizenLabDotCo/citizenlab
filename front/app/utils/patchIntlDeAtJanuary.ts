/**
 * Overrides the Austrian German (de-AT) January month name — "Jänner" (wide)
 * and "Jän" (short) — with "Januar" / "Jan" wherever it is produced by the
 * platform's native `Intl` API.
 *
 * This is the counterpart to the date-fns (`i18n/de-AT.ts`) and moment
 * (`patchMomentDeAtJanuary.ts`) overrides. react-intl's `formatDate` /
 * `<FormattedDate>` — and any raw `new Intl.DateTimeFormat(...)` or
 * `Date#toLocale*` call — delegate to the browser's CLDR data, where de-AT
 * January is "Jänner"/"Jän". @formatjs reads the global `Intl.DateTimeFormat` at
 * format time, so wrapping the constructor here (plus the `Date#toLocale*`
 * helpers, which use the intrinsic directly) catches every native-Intl path.
 *
 * Because "Jän" is unique to de-AT January, the rewrite is a safe no-op for
 * every other locale. The narrow form ("J") is left untouched.
 *
 * Imported for side effects at the very top of `root.tsx` so it runs before the
 * first date is formatted. Idempotent.
 */

const JAEN = 'Jän'; // prefix shared by both "Jänner" (wide) and "Jän" (short)
const PATCHED = '__deAtJanuarPatched';

type DateArg = Date | number | undefined;

// Rewrite the wide form first ("Jänner" -> "Januar"), then the short form
// ("Jän" -> "Jan"). Order matters: "Jän" is a prefix of "Jänner", so the wide
// replacement must run before the short one (after it, "Januar" has no "Jän").
const januarize = (value: string): string =>
  value.includes(JAEN)
    ? value.split('Jänner').join('Januar').split('Jän').join('Jan')
    : value;

const januarizeParts = (
  parts: Intl.DateTimeFormatPart[]
): Intl.DateTimeFormatPart[] =>
  parts.map((part) =>
    part.type === 'month' ? { ...part, value: januarize(part.value) } : part
  );

const isDeAt = (dtf: Intl.DateTimeFormat): boolean =>
  dtf.resolvedOptions().locale.toLowerCase().startsWith('de-at');

// Replace an instance method with `wrapped`. `format` is an inherited accessor
// (getter, no setter), so a plain assignment throws in strict mode — define an
// own data property instead.
const define = (
  target: object,
  name: string,
  wrapped: (...args: never[]) => unknown
): void => {
  Object.defineProperty(target, name, {
    value: wrapped,
    configurable: true,
    writable: true,
  });
};

const wrapInstance = (dtf: Intl.DateTimeFormat): void => {
  const originalFormat = dtf.format.bind(dtf);
  define(dtf, 'format', (date: DateArg) => januarize(originalFormat(date)));

  const originalFormatToParts = dtf.formatToParts.bind(dtf);
  define(dtf, 'formatToParts', (date: DateArg) =>
    januarizeParts(originalFormatToParts(date))
  );

  // formatRange / formatRangeToParts exist in modern engines only.
  const ranged = dtf as Intl.DateTimeFormat & {
    formatRange?: (start: Date | number, end: Date | number) => string;
    formatRangeToParts?: (
      start: Date | number,
      end: Date | number
    ) => Intl.DateTimeFormatPart[];
  };
  if (typeof ranged.formatRange === 'function') {
    const original = ranged.formatRange.bind(dtf);
    define(dtf, 'formatRange', (start: Date | number, end: Date | number) =>
      januarize(original(start, end))
    );
  }
  if (typeof ranged.formatRangeToParts === 'function') {
    const original = ranged.formatRangeToParts.bind(dtf);
    define(
      dtf,
      'formatRangeToParts',
      (start: Date | number, end: Date | number) =>
        januarizeParts(original(start, end))
    );
  }
};

const patchDateTimeFormatConstructor = (): void => {
  const Original = Intl.DateTimeFormat;
  if ((Original as unknown as Record<string, unknown>)[PATCHED]) return;

  // Kept as a plain function while we set up prototype/statics (the constructor
  // type's `prototype` is read-only); cast to the constructor type at the end.
  // Called only via `new` (incl. `new (Intl.DateTimeFormat).bind.apply(...)` as
  // @formatjs does); returning an object makes `new` yield it.
  const Patched = function (
    locales?: string | string[],
    options?: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat {
    const dtf = new Original(locales, options);
    if (isDeAt(dtf)) wrapInstance(dtf);
    return dtf;
  };

  Patched.prototype = Original.prototype;
  const patched = Patched as unknown as typeof Intl.DateTimeFormat &
    Record<string, unknown>;
  patched.supportedLocalesOf = Original.supportedLocalesOf.bind(Original);
  patched[PATCHED] = true;

  Intl.DateTimeFormat = patched;
};

// Date#toLocaleDateString / #toLocaleString use the %DateTimeFormat% intrinsic
// directly, not the global we patched above, so wrap them too. januarize is
// applied unconditionally — safe because "Jänner" only occurs for de-AT.
const patchDatePrototype = (): void => {
  const proto = Date.prototype;
  (['toLocaleDateString', 'toLocaleString'] as const).forEach((name) => {
    const original = proto[name];
    if ((original as unknown as Record<string, unknown>)[PATCHED]) return;

    const wrapped = function (
      this: Date,
      locales?: string | string[],
      options?: Intl.DateTimeFormatOptions
    ): string {
      return januarize(original.call(this, locales, options));
    };
    (wrapped as unknown as Record<string, unknown>)[PATCHED] = true;
    proto[name] = wrapped;
  });
};

patchDateTimeFormatConstructor();
patchDatePrototype();
