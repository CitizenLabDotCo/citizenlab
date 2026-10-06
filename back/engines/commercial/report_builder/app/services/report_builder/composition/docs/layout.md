# How the layout widgets fit together

A report is a flat map of nodes. `ROOT` lists its children in `nodes`, in reading order;
every other node names its `parent`. The widget reference in the prompt gives each
widget's props; this is how they are used together.

## The spine of a report

```
Cover
PageBreak
TableOfContents
PageBreak
Divider (variant "section") · TextMultiloc <h2>Executive summary</h2> + bullets
Divider (variant "section") · TextMultiloc <h2>Taking part</h2> · WhiteSpace small · CustomBlock
WhiteSpace large
Divider (variant "section") · TextMultiloc <h2>Results</h2> · ...
```

The Divider plus the `<h2>` is what makes a section; the TableOfContents reads its entries
from the `<h2>` headings in TextMultiloc nodes, so a section without one does not appear
in the contents.

## Two charts side by side

A `TwoColumn` has two slots, `left` and `right`, each a `Container`. The slots are in
`linkedNodes`, not `nodes`, and each Container's children go in its own `nodes`:

```json
"twocol0001": { "type": {"resolvedName":"TwoColumn"}, "props": {"columnLayout":"1-1"},
                "parent": "ROOT", "nodes": [], "linkedNodes": {"left":"colleft01","right":"colright1"} },
"colleft01":  { "type": {"resolvedName":"Container"}, "props": {}, "parent": "twocol0001",
                "nodes": ["chartaaaa1"], "linkedNodes": {} },
"colright1":  { "type": {"resolvedName":"Container"}, "props": {}, "parent": "twocol0001",
                "nodes": ["chartbbbb1"], "linkedNodes": {} }
```

A chart in a half column has half the width: keep its labels short, or give it the full
width instead. Two charts side by side only when they are read together.

## Headline numbers

`KeyFigures` carries `figures`, an array of `{ value, label }`, each a short string. Three
or four figures read as a band; more is a table. Every value must be a number you saw in
a query result. It goes directly under a section's heading, before any paragraph.

## Breaking pages

`PageBreak` is the only control over where a page ends. It is required after the cover and
after the contents. A chart never splits across a page, so a tall chart or a long section
may push the next heading onto a new page; put a PageBreak before the heading when a
section deserves a page of its own. `WhiteSpace` sizes: `small` between a sentence and its
chart, `large` between sections.

## Placing a chart

A `CustomBlock` node pins the exact chart it shows:

```json
"chartaaaa1": { "type": {"resolvedName":"CustomBlock"},
                "props": {"blockId":"<from author_chart_block>", "version": 1, "config": {}},
                "parent": "ROOT", "nodes": [], "linkedNodes": {} }
```

`version` is the number author_chart_block or edit_source returned. After an edit the
block has a new version and the node still points at the old one: patch the node, or the
report keeps showing the chart you just fixed. `config` starts empty; the admin fills it
in the sidebar.

## Patching

Send only the nodes you add or change, each complete. To add a node, send it and the
parent with its `nodes` array including the new id. To move a node, send only the parent
with `nodes` reordered. To remove one, name it in `delete_node_ids`; its children go with
it. Ids are 10 characters of `[A-Za-z0-9_-]`; the first patch must include `ROOT`.
