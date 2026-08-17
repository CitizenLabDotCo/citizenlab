# Converting a moment call to `utils/dateFormat`

Reference for the moment → date-fns migration. If you are picking up one of the
batch tickets, this is the whole thing you need.

## The one question

**Is this string for a machine or for a human?**

- **Machine** — API params, query keys, sorting, `data-` attributes. Must be
  byte-identical in every language. → `toIsoDate()`
- **Human** — anything rendered on screen. Must adapt per language.
  → `useFormatDate()` in components, or the `utils/dateFormat` functions with an
  explicit locale outside components.

## Cheat sheet

| moment                     | replacement                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `.format('YYYY-MM-DD')`    | `toIsoDate(value)`                                           |
| `.format('YYYY-MM')`       | `toIsoMonth(value)`                                          |
| `.format('LL')`            | `formatDate.longDate(value)`                                 |
| `.format('L')`             | `formatDate.shortDate(value)`                                |
| `.format('LT')`            | `formatDate.time(value)`                                     |
| `.format('LLL')`           | `formatDate.dateTime(value)`                                 |
| `.format('MMMM')`          | `formatDate.month(value)`                                    |
| `.format('MMM')`           | `formatDate.monthShort(value)`                               |
| `.format('dddd')`          | `formatDate.weekday(value)`                                  |
| `.format('z')`             | `formatDate.timeZoneAbbreviation(value)`                     |
| `.format('Z')`             | `formatUtcOffset(value)`                                     |
| `moment.tz.setDefault(tz)` | `setTenantZone(tz)` — already wired in `App`, don't add more |

## In a component

```tsx
import useFormatDate from 'hooks/useFormatDate';
import { toIsoDate } from 'utils/dateFormat';

const EventCard = ({ event }) => {
  const formatDate = useFormatDate();

  return (
    <time dateTime={toIsoDate(event.attributes.start_at)}>
      {formatDate.longDate(event.attributes.start_at)}
    </time>
  );
};
```

Note the split: the machine value goes in `dateTime=`, the human value in the
body. That is the whole rule in one element.

## Outside a component

Parsers, `api/` helpers and chart data prep cannot call a hook.

- Machine formats need no locale — import `toIsoDate` directly.
- Localized formats take the locale as a parameter, passed down from whichever
  component called them. Do **not** reach for a module-level locale; there
  isn't one, deliberately (see the header comment in `dateFormat.ts`).

```ts
import { formatMonthShort, toIsoDate } from 'utils/dateFormat';

export const toAxisLabel = (date: string, locale: SupportedLocale) =>
  formatMonthShort(date, locale);

export const toQueryParam = (date: string) => toIsoDate(date);
```

## Three traps

**1. `YYYY` and `DD` mean different things in date-fns.** `YYYY` is the
week-numbering year, `DD` is the day of the year. date-fns throws a
`RangeError` rather than failing quietly, but don't write them in the first
place — use `toIsoDate()` and you never touch a token.

**2. Don't use date-fns `PP` for long dates.** It abbreviates the month
("Mar 22, 2026"). The `formatDate.longDate` helper uses `Intl` and keeps
"March 22, 2026", matching what users see today.

**3. Don't hand-build localized patterns.** `'MMMM d, yyyy'` looks fine in
English and renders "mars 22, 2026" in French — wrong word order. The helpers
reorder per language automatically.

## Known deltas from moment

These are **expected and accepted** — see the snapshot in
`utils/__characterization__/momentVsFacade.test.ts` for the full list. Don't
try to "fix" them back to moment's output.

| What                               | moment           | now             | status                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machine format in `ar-SA`, `pa-IN` | `٢٠٢٦-٠٣-٢٢`     | `2026-03-22`    | ✅ **Bug fix.** moment localized digits into API params.                                                                                                                                                                                                                                                      |
| Timezone abbreviation              | `CET` everywhere | per-language    | ✅ **Accepted.** Most locales still show `CET`/`CEST`; German shows `MEZ`/`MESZ` (correct for German, where moment wrongly showed `CET`). Only `en`, `fr-*` and `fi-FI` show an offset (`GMT+1`), because CLDR defines no short abbreviation for European zones in those languages. Don't add a lookup table. |
| Abbreviated months                 | `mar`            | `mar.`          | ✅ Accepted — CLDR punctuation, varies by locale.                                                                                                                                                                                                                                                             |
| Greek standalone month             | `Μάρτιος`        | `Μαρτίου`       | ✅ Accepted — Intl only exposes the formatting (genitive) form.                                                                                                                                                                                                                                               |
| `sr-SP`                            | Latin script     | Cyrillic script | ⏳ **Open** — moment fell back to `sr`; Intl honours the actual locale.                                                                                                                                                                                                                                       |
| `kl-GL`                            | Danish           | Greenlandic     | ⏳ **Open** — moment fell back to `da`; Intl honours the actual locale.                                                                                                                                                                                                                                       |

The two marked open are user-visible _language_ changes, not formatting
changes, and need a product decision before the batch tickets land. Everything
else above is settled — treat a snapshot diff matching one of the accepted rows
as expected.

## Before you open the PR

```bash
nvm use 24
npx jest app/utils/__characterization__   # must stay green
npm run typecheck
```

If a characterization snapshot fails, a date changed on screen for real users.
Read the diff and decide — do not run `-u` to make it go away.
