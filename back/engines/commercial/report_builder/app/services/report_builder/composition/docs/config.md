# What config_schema can express

`config_schema` is a JSON Schema object. Each property becomes one control in the report
builder sidebar, and its value reaches the block as `config[key]`. Six properties is the
most a chart may expose; two is usual.

Config changes how a chart looks. It cannot change what a chart reads: the SQL is a static
string extracted at build time, and a value in `config` can never reach it.

## The field types

| type | control | arrives as |
|---|---|---|
| `string` | text input | `string` |
| `string` with `"x-multiloc": true` | one input per locale | `{ en: '...', nl: '...' }` — read it with `localize()` |
| `string` with `enum: [...]` | dropdown | one of the enum values |
| `string` with `"x-picker": "project"` | a project picker | the project id |
| `integer`, `number` | number input | `number` |
| `boolean` | checkbox | `boolean` |

Every property needs a `title`: it is the label the admin reads. `default` is what the
chart does before anything is touched, and the block must behave exactly that way when
the value is absent, because a placed chart starts with `config: {}`.

## The usual shape

```json
{"type":"object",
 "properties":{
   "title":{"type":"string","x-multiloc":true,"title":"Chart title"},
   "caption":{"type":"string","x-multiloc":true,"title":"Caption"},
   "showValues":{"type":"boolean","title":"Show the value on each bar","default":true},
   "topN":{"type":"integer","title":"How many rows to show","default":10}
 }}
```

Title and caption are always exposed as multiloc strings, so the wording can be fixed in
every language without touching code. Then one or two fields where the chart has a real
choice: how many rows, which measure, the sort direction.

## Reading the fields in the block

Declare a `Config` type that mirrors the schema (every field optional, because a placed
chart starts with `config: {}`) and type the props with it:

```tsx
import type { BlockProps, Multiloc } from 'gv-sdk';

type Config = { title?: Multiloc; caption?: Multiloc; showValues?: boolean; topN?: number };

export default function Block({ config, msg }: BlockProps<Config>) {
  const localize = useLocalize();
  const showValues = config.showValues !== false;          // boolean, defaulting to true
  const topN = config.topN ?? 10;
  const title = localize(config.title) || msg('title');    // multiloc, falling back to the catalogue
  const shown = rows.slice(0, topN);
```

The source is typechecked with strict settings: an untyped `{ config, msg }` or an
untyped callback parameter is an error, not a warning.

## What a field must not do

- Declare a field the block never reads. It is a promise to the admin that nothing keeps.
- Carry an id the chart queries with. Pickers exist to label, filter rows that are already
  in the result, or choose between series — never to build the SQL.
- Use a type the sidebar cannot render: no arrays, no nested objects.
