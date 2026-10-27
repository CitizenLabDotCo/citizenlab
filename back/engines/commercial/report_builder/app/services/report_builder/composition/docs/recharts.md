# Chart forms, with recharts as the SDK exposes it

The SDK exports these from recharts, as-is: `ResponsiveContainer`, `BarChart`, `Bar`,
`LineChart`, `Line`, `AreaChart`, `Area`, `PieChart`, `Pie`, `Cell`, `XAxis`, `YAxis`,
`CartesianGrid`, `Tooltip`, `Legend`, `LabelList`. Nothing else from recharts exists in a
block. Every chart sits in `<Box width="100%" height="...px">` around a
`<ResponsiveContainer width="100%" height="100%">`; a parent with no height draws nothing.

Colours come from `useTheme().colors` (`tenantPrimary`, `tenantSecondary`) and the platform
tokens in `colors` (`grey200`, `grey400`, `textPrimary`, `textSecondary`). Never a hex literal.
Callback parameters are typed (`import type { ReportingRow } from 'gv-sdk'`); the strict
typechecker refuses an implicit `any`.
Set `isAnimationActive={false}` on every series: the report is checked and printed, and an
animation is a half-drawn chart to both.

## Horizontal bars, sorted (the default for categories)

Sort in SQL (`ORDER BY count DESC`). Labels live on the axis, not in the margin.

```tsx
<BarChart data={rows} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
  <CartesianGrid stroke={colors.grey200} horizontal={false} />
  <XAxis type="number" hide />
  <YAxis type="category" dataKey="label" width={160} tickLine={false} axisLine={false}
         stroke={colors.textSecondary} fontSize={12} />
  <Bar dataKey="count" fill={theme.colors.tenantPrimary} radius={[0, 4, 4, 0]} barSize={18}
       isAnimationActive={false}>
    <LabelList dataKey="count" position="right" fontSize={12} fill={colors.textPrimary} />
  </Bar>
</BarChart>
```

## Stacked bars for part-of-a-whole, and for ordered scales

One `Bar` per series, all with the same `stackId`. For an ordered scale (1 to 5, agree to
disagree) keep the series in scale order and shade them from light to dark in one hue;
never re-sort by size. Shape the rows so each row is one category and each series is a
column: `SELECT phase, SUM(...) FILTER (WHERE answer = 'agree') AS agree, ...`.

```tsx
<BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
  <XAxis type="number" hide />
  <YAxis type="category" dataKey="label" width={160} tickLine={false} axisLine={false}
         stroke={colors.textSecondary} fontSize={12} />
  <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
  <Bar dataKey="agree" stackId="a" fill={theme.colors.tenantPrimary} isAnimationActive={false} />
  <Bar dataKey="neutral" stackId="a" fill={colors.grey400} isAnimationActive={false} />
  <Bar dataKey="disagree" stackId="a" fill={colors.grey200} isAnimationActive={false} />
</BarChart>
```

A `Legend` is required as soon as there are two series. Series names on the legend come
from each `Bar`'s `name` prop — pass `name={msg('agree')}` so they are translated.

## Change over time

One `Line` per series; `Area` for a single series when the volume matters more than the
trend. Format the x values in SQL (`to_char(date_trunc('month', contributed_at), 'Mon YYYY')`)
so the axis reads as text and needs no formatter. Label the last point: that is the value
the sentence above the chart is about.

```tsx
const last = rows[rows.length - 1];
const lastValue = (entry: ReportingRow) => (entry.month === last.month ? entry.participants : '');

<LineChart data={rows} margin={{ top: 16, right: 24, bottom: 4, left: 0 }}>
  <CartesianGrid stroke={colors.grey200} vertical={false} />
  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={colors.textSecondary} fontSize={12} />
  <YAxis width={40} tickLine={false} axisLine={false} stroke={colors.textSecondary}
         fontSize={12} allowDecimals={false} />
  <Line type="monotone" dataKey="participants" stroke={theme.colors.tenantPrimary} strokeWidth={2}
        dot={{ r: 3 }} isAnimationActive={false}>
    <LabelList valueAccessor={lastValue} position="top" fontSize={12} fill={colors.textPrimary} />
  </Line>
</LineChart>
```

## Two or three slices that sum to something

A pie is only right for two or three slices. Label every slice with its share, in the slice
or beside it; a pie that needs a tooltip is a table.

```tsx
<PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
  <Pie data={rows} dataKey="count" nameKey="label" innerRadius={50} outerRadius={90}
       isAnimationActive={false} label={(entry: ReportingRow) => `${entry.label} ${entry.share}%`} labelLine={false}>
    {rows.map((row, index) => (
      <Cell key={row.label} fill={index === 0 ? theme.colors.tenantPrimary : colors.grey400} />
    ))}
  </Pie>
</PieChart>
```

Compute `share` in SQL (`ROUND(100.0 * count / SUM(count) OVER (), 0) AS share`) rather than
in the block.

## What not to do

- No `Tooltip` as the only place a value can be read; the report is printed.
- No two y-axes. Two measures of different scale are two charts.
- No fixed pixel width on the chart or its box; width is always `100%` of the column.
- No more than six series with distinct hues, and never without a `Legend`.
