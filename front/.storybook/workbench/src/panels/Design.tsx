import { useEffect, useMemo, useRef, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import Icon, { IconName } from '../components/Icon';
import InspSection from '../components/InspSection';
import TokenPicker from '../components/TokenPicker';
import { ValueField } from '../components/ValueField';
import { resolveTokens } from '../lib/contrast';
import { loadStoryIndex } from '../lib/data';
import type { Finding, TokenMeta } from '../lib/data';
import { editId, ElementEdit, valueFits } from '../lib/elementEdits';
import { healToken, isHealable } from '../lib/healTask';
import { suggestionsFor } from '../lib/legacyTokens';
import {
  atPath,
  ColourGroup,
  ColourUse,
  defaultTarget,
  fitsProp,
  InspectRow,
  InspectSection,
  Inspection,
  inspectElement,
  LayerKind,
  labelOf,
  opacityValue,
  parentTarget,
  pathOf,
  rowSpec,
  shortName,
} from '../lib/inspect';
import type { Overrides } from '../lib/overrides';
import { snapValue } from '../lib/overrides';
import {
  shortFile,
  sourceLine,
  SourceLine,
  tracedWords,
  commitLink,
} from '../lib/sourceLine';
import { pickerGroups } from '../lib/tokenPicker';
import { DEFS } from '../lib/tokenValues';
import { Painted, traceElement } from '../lib/trace';
import type { ElementTrace } from '../lib/trace/types';

import Controls from './Controls';

type Selection = {
  selected: Element | null;
  version: number;
  pick: (el: Element | null) => void;
  label?: string;
};

type Props = {
  storyId: string;
  frames: (Window | null)[];
  selection: Selection;
  meta: TokenMeta[];
  // Token overrides, for live values.
  overrides: Overrides;
  edits: ElementEdit[];
  addEdit: (e: ElementEdit) => void;
  removeEdit: (id: string) => void;
  // The component file's findings (fileFindings).
  findings: Finding[];
};

// Pauses after a render or an edit before the selection is read again.
const SETTLE_MS = [60, 600];
// "Also in this file" rows shown before "Show all".
const ALSO_FIRST = 12;
// Selection colours shown before "Show all".
const COLOURS_FIRST = 8;
// Rows whose typed bare number is a length in px.
const PX_ROWS = /^(size|ls|stroke-width(-.+)?|icon-stroke-width)$/;

// The Source line at the top of the tab: the component that owns the
// selection's styles, its line, and how many of its values are traced.
const SourceHead = ({ trace }: { trace?: ElementTrace }) => {
  if (!trace) return null;
  const noIndex =
    trace.props.length > 0 && trace.props.every((p) => p.why === 'no-index');
  if (noIndex) {
    return (
      <p className="wb-insp-source-head" data-testid="wb-insp-source-head">
        No code index in this build: values are not traced
      </p>
    );
  }
  const { owner } = trace;
  return (
    <p
      className="wb-insp-source-head"
      data-testid="wb-insp-source-head"
      data-traced={trace.traced}
      data-total={trace.total}
    >
      {owner ? (
        <>
          <code>{owner.name ?? 'component'}</code>
          {' · '}
          <a
            href={commitLink(trace.commit, owner.file, owner.line)}
            target="_blank"
            rel="noopener"
          >
            {`${shortFile(owner.file)}:${owner.line}`}
          </a>
          {' · '}
        </>
      ) : null}
      {tracedWords(trace.traced, trace.total)}
    </p>
  );
};

// The layer button's glyph, as Figma marks a layer's kind.
const KIND_GLYPH: Record<LayerKind, IconName> = {
  box: 'layers',
  text: 'text',
  icon: 'fill',
  image: 'image',
  field: 'edit',
};

// Where a Selection colour sits on its element, for the Changes list.
const USE_GROUP: Record<string, string> = {
  fill: 'Fill',
  color: 'Text',
  'icon-fill': 'Fill',
  'icon-stroke': 'Stroke',
};

// What an edit is on: the element (its path under the story box), the row,
// and the property it belongs to in the Changes list.
type Target = { path: number[] | null; row: InspectRow; group: string };

// Whether the frame can draw a font family: the text measures differently
// from two fallbacks when it can. Generic families always can.
const fontCheck = (doc: Document) => {
  const ctx = doc.createElement('canvas').getContext('2d');
  const cache = new Map<string, boolean>();
  const GENERIC =
    /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|BlinkMacSystemFont)$/i;
  return (family: string) => {
    if (GENERIC.test(family)) return true;
    if (!ctx) return true;
    let ok = cache.get(family);
    if (ok === undefined) {
      const width = (font: string) => {
        ctx.font = `32px ${font}`;
        return ctx.measureText('mmmmmmmmmlli1WQgé').width;
      };
      ok =
        width(`"${family}", monospace`) !== width('monospace') ||
        width(`"${family}", serif`) !== width('serif');
      cache.set(family, ok);
    }
    return ok;
  };
};

// The ancestors of the selection up to the story box, nearest first.
const ancestorsOf = (el: Element): Element[] => {
  const out: Element[] = [];
  let at = parentTarget(el);
  while (at) {
    out.push(at);
    at = parentTarget(at);
  }
  return out;
};

const GLYPH_OF_FINDING: Record<string, IconName> = {
  px: 'padding',
  hex: 'fill',
  rgba: 'fill',
  'named-color': 'fill',
  'layout-spacing': 'gap',
  'styled-block': 'layers',
  'legacy-theme': 'tokens',
  'legacy-colors': 'fill',
  'legacy-bo': 'tokens',
};

const flatRaw = (raw: string) => raw.replace(/\s+/g, '');

// The Design tab: the selected element, its values as fields and pills,
// the rest of the file's hard values, the props.
const Design = ({
  storyId,
  frames,
  selection,
  meta,
  overrides,
  edits,
  addEdit,
  removeEdit,
  findings,
}: Props) => {
  const frame = frames[0];
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [picker, setPicker] = useState<string | undefined>();
  const [ancestors, setAncestors] = useState(false);
  const [alsoAll, setAlsoAll] = useState(false);
  const [coloursAll, setColoursAll] = useState(false);
  const { selected, version, pick } = selection;
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const resolved = live;

  // Read the selection after it changes, renders, or an edit lands; again
  // once the frame settles (the city's tenant tokens are written after the
  // first render) and whenever a web font finishes loading.
  useEffect(() => {
    if (!selected || !frame) {
      setInspection(null);
      return undefined;
    }
    const read = () => {
      try {
        setInspection(inspectElement(selected, fontCheck(frame.document)));
      } catch {
        setInspection(null);
      }
    };
    const timers = SETTLE_MS.map((ms) => window.setTimeout(read, ms));
    let fonts: FontFaceSet | undefined;
    try {
      fonts = frame.document.fonts;
      fonts.addEventListener('loadingdone', read);
    } catch {
      fonts = undefined;
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      fonts?.removeEventListener('loadingdone', read);
    };
  }, [selected, version, frame, meta, overrides, edits]);
  useEffect(() => {
    setPicker(undefined);
    setAncestors(false);
    setColoursAll(false);
  }, [selected]);

  // Where each value comes from: traced after the rows render, so a row
  // shows its value at once and its source line when the trace lands.
  const [trace, setTrace] = useState<{
    el: Element;
    key: string;
    t: ElementTrace;
  } | null>(null);
  const longhands = useMemo(
    () => [
      ...new Set(
        (inspection?.sections ?? []).flatMap((s) =>
          s.rows.flatMap((r) => r.props)
        )
      ),
    ],
    [inspection]
  );
  const longKey = longhands.join(',');
  useEffect(() => {
    if (!selected || !frame || longhands.length === 0) {
      setTrace(null);
      return undefined;
    }
    let live = true;
    // What the session's edits paint inline reads as "your edit", not as
    // the story's own inline style.
    const painted: Painted = (el, longhand) =>
      edits.some(
        (e) =>
          e.storyId === storyId &&
          !!e.path &&
          e.props.includes(longhand) &&
          atPath(el.ownerDocument, e.path) === el
      );
    // The story's own file tells its frame from a look-alike in another
    // story.
    loadStoryIndex()
      .then((index) =>
        traceElement(frame, selected, longhands, {
          painted,
          storyFile: index.entries[storyId]?.importPath.replace(/^\.\//, ''),
        })
      )
      .then((t) => {
        if (live) setTrace({ el: selected, key: longKey, t });
      })
      .catch(() => {
        if (live) setTrace(null);
      });
    return () => {
      live = false;
    };
    // longKey stands for longhands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, frame, longKey, version, edits, storyId]);
  const sourceOf = (r: InspectRow): SourceLine | 'pending' | undefined => {
    // A row with no style behind it: an image's picture is its src.
    if (r.props.length === 0) {
      return {
        status: 'untraced',
        text: 'not traced: an image shows its src, which is not a style',
      };
    }
    // A trace of the same element for other rows is not this one's yet.
    if (!trace || trace.el !== selected || trace.key !== longKey) {
      return 'pending';
    }
    return sourceLine(
      trace.t.props.filter((p) => r.props.includes(p.prop)),
      trace.t.commit
    );
  };

  const path = selected ? pathOf(selected) : null;
  const idOf = (t: Target) => editId(storyId, t.path, t.row.id);
  const editOf = (t: Target) => edits.find((e) => e.id === idOf(t));
  // What the row was before the session touched it: the first edit keeps it.
  const originOf = (t: Target): ElementEdit['from'] =>
    editOf(t)?.from ?? {
      raw: t.row.value.raw,
      shown: t.row.value.shown,
      token: t.row.value.token,
    };
  // The property a row of the selection belongs to: Layout holds padding
  // and gap rows, Appearance the radius.
  const at = (row: InspectRow, sectionLabel: string): Target => ({
    path,
    row,
    group: row.id.startsWith('padding')
      ? 'Padding'
      : row.id.startsWith('gap')
      ? 'Gap'
      : row.id.startsWith('radius')
      ? 'Radius'
      : sectionLabel,
  });
  const base = (t: Target) => ({
    id: idOf(t),
    storyId,
    path: t.path,
    rowId: t.row.id,
    label:
      t.row.label && t.row.label !== t.group
        ? `${t.group} · ${t.row.label}`
        : t.group,
    glyph: t.row.glyph,
    props: t.row.props,
    from: originOf(t),
    at: Date.now(),
  });
  // A token for the row: an attach when the row started as a text value,
  // a swap when it started bound. Back to where it started = no edit.
  const bind = (t: Target, token: TokenName) => {
    const from = originOf(t);
    const v = t.row.value;
    if (from.token === token) {
      removeEdit(idOf(t));
      return;
    }
    // An attach of a traced value carries the expression it replaces, so
    // Send writes that line; untraced, it goes as a task.
    // Once edited the row traces to the edit: keep the first trace.
    const line = from.token ? undefined : sourceOf(t.row);
    const source =
      editOf(t)?.source ??
      (line && line !== 'pending' ? line.trace : undefined);
    addEdit({
      ...base(t),
      to: { value: resolved[token] ?? v.raw, token },
      kind: from.token ? 'swap' : 'attach',
      ...(source ? { source } : {}),
    });
  };
  const detach = (t: Target) => {
    const from = originOf(t);
    // A pill the session attached goes back to its text value.
    if (!from.token && editOf(t)) {
      removeEdit(idOf(t));
      return;
    }
    addEdit({ ...base(t), to: { value: t.row.value.raw }, kind: 'detach' });
  };
  // A value as it is; back where the row started it is no edit.
  const custom = (t: Target, value: string) => {
    if (value === originOf(t).raw) {
      if (editOf(t)) removeEdit(idOf(t));
    } else {
      addEdit({ ...base(t), to: { value }, kind: 'custom' });
    }
  };
  const commit = (t: Target, typed: string, exact = false): boolean => {
    const { row } = t;
    if (row.id === 'opacity') {
      const share = opacityValue(typed);
      if (share === undefined) return false;
      custom(t, share);
      return true;
    }
    const bare = /^-?\d+(\.\d+)?$/.test(typed);
    const length =
      (row.snap === 'space' || row.snap === 'radius' || PX_ROWS.test(row.id)) &&
      bare;
    let value = length ? `${typed}px` : typed;
    if (row.snap === 'color' && /^[0-9a-f]{3,8}$/i.test(value)) {
      value = `#${value}`;
    }
    if (!valueFits(row.id, value)) return false;
    // An arrow step or a menu choice lands where it points, off the scale
    // or not.
    if (exact || row.choices) {
      custom(t, value);
      return true;
    }
    const r = snapValue(row.snap, value, meta);
    // Rows with no scale take a token whose value the typed one equals.
    const equal = r.to
      ? undefined
      : pickerGroups(
          meta,
          fitsProp(row.props[0]) ?? (() => false),
          resolved,
          value,
          ''
        ).find((g) => g.id === 'match')?.tokens[0];
    const token = (r.to ?? equal?.name) as TokenName | undefined;
    if (token) bind(t, token);
    else custom(t, value);
    return true;
  };
  // "+" on an empty Fill, Stroke or Effects: Figma's default look, a
  // custom value until a token is picked for it.
  const add = (s: InspectSection) => {
    if (!s.add) return;
    const spec = rowSpec(s.add.rowId);
    const t: Target = {
      path,
      row: {
        id: s.add.rowId,
        label: '',
        value: { raw: s.add.from, shown: 'None' },
        ...spec,
      },
      group: s.label,
    };
    addEdit({ ...base(t), to: { value: s.add.value }, kind: 'custom' });
  };

  // A Selection colour stands for every use of it: each use is the row of
  // its own element, so the edit shows there too.
  const useTarget = (u: ColourUse): Target | null => {
    const p = pathOf(u.el);
    if (!p) return null;
    const group = USE_GROUP[u.rowId] ?? 'Stroke';
    return {
      path: p,
      row: {
        id: u.rowId,
        label: labelOf(u.el),
        value: u.value,
        ...rowSpec(u.rowId),
      },
      group,
    };
  };
  const eachUse = (g: ColourGroup, f: (t: Target) => void) => {
    for (const u of g.uses) {
      const t = useTarget(u);
      if (t) f(t);
    }
  };
  const colourRow = (g: ColourGroup): InspectRow => ({
    id: `colour-${g.key}`,
    label: `Colour, ${g.uses.length} ${g.uses.length === 1 ? 'use' : 'uses'}`,
    value: g.value,
    props: ['color'],
    glyph: 'fill',
    half: false,
    editable: true,
    snap: 'color',
  });

  // Hard values of the file the selection does not cover: every healable
  // finding, minus those a file edit already stands for.
  const covered = new Set(
    edits.filter((e) => e.kind === 'file').map((e) => `${e.line}:${e.col}`)
  );
  const also = findings.filter(
    (f) => isHealable(f) && !covered.has(`${f.line}:${f.col}`)
  );
  const alsoShown = alsoAll ? also : also.slice(0, ALSO_FIRST);
  const healFile = (f: Finding) => {
    const token = healToken(f, meta)[0] as TokenName | undefined;
    const raw = flatRaw(f.raw);
    addEdit({
      id: editId(storyId, null, `${f.line}:${f.col}`),
      storyId,
      path: null,
      rowId: 'file',
      label: `${f.category} L${f.line}`,
      glyph: GLYPH_OF_FINDING[f.category] ?? 'tokens',
      props: [],
      from: { raw, shown: raw },
      to: { value: token ? resolved[token] ?? '' : '', token },
      kind: 'file',
      file: f.file,
      line: f.line,
      col: f.col,
      at: Date.now(),
    });
  };

  const up = selected ? ancestorsOf(selected) : [];
  // The component's own props sit on top, open while the component itself
  // is selected (Figma shows an instance's properties first), folded for a
  // layer inside it. A selection the story's remount left behind (a city
  // switch) keeps the last answer until the new element is found.
  const rootRef = useRef(true);
  if (!selected) rootRef.current = true;
  else if (selected.isConnected && frame) {
    try {
      rootRef.current = selected === defaultTarget(frame.document);
    } catch {
      // The frame navigated away.
    }
  }
  const root = rootRef.current;
  const props = (
    <details
      className="wb-insp-block wb-insp-props"
      data-testid="wb-insp-props"
      data-root={root}
      open={root}
    >
      <summary className="wb-insp-head">
        <h3>Props</h3>
        <Icon name="chevron" size={14} />
      </summary>
      <Controls storyId={storyId} frames={frames} />
    </details>
  );
  // The tokens the token data lists for the code a traced value is read
  // from, each with what it does to the look.
  const suggestOf = (r: InspectRow, line?: SourceLine | 'pending') => {
    if (!line || line === 'pending' || line.status !== 'traced') {
      return undefined;
    }
    // Only a token the codemod can write: the line names one expression.
    if (!line.legacyKey || !line.trace || !r.editable) return undefined;
    const hex = /^[0-9A-F]{6}$/i.test(r.value.shown);
    return suggestionsFor(
      line.legacyKey,
      r.snap === 'color' && hex ? `#${r.value.shown}` : r.value.raw,
      meta,
      (token) => resolved[token] ?? ''
    );
  };
  const field = (
    key: string,
    r: InspectRow,
    t: Target,
    on: {
      commit: (typed: string, exact?: boolean) => boolean;
      attach: (token: TokenName) => void;
      detach: () => void;
    },
    line?: SourceLine | 'pending'
  ) => (
    <div
      key={key}
      className={r.half ? 'wb-insp-prop' : 'wb-insp-prop wb-insp-full'}
    >
      <ValueField
        row={r}
        liveToken={r.value.token ? resolved[r.value.token] : undefined}
        edit={editOf(t)}
        onCommit={on.commit}
        onAttach={on.attach}
        onDetach={on.detach}
        onOpenPicker={() => setPicker(picker === key ? undefined : key)}
        source={line}
        suggestions={suggestOf(r, line)}
        onSelect={pick}
        labelOf={labelOf}
      />
      {picker === key && (
        <TokenPicker
          row={r}
          meta={meta}
          resolved={resolved}
          onPick={(token) => {
            on.attach(token);
            setPicker(undefined);
          }}
          onClose={() => setPicker(undefined)}
        />
      )}
    </div>
  );
  const colours = inspection?.colours ?? [];
  const coloursShown = coloursAll ? colours : colours.slice(0, COLOURS_FIRST);
  const sectionOf = (s: InspectSection) => (
    <InspSection
      key={s.id}
      id={s.id}
      title={s.label}
      empty={s.rows.length === 0}
      actions={
        s.add && (
          <button
            type="button"
            className="wb-icon-button wb-insp-action"
            data-testid="wb-insp-add"
            data-section={s.id}
            aria-label={s.add.label}
            title={s.add.label}
            onClick={() => add(s)}
          >
            <Icon name="plus" size={14} />
          </button>
        )
      }
    >
      {s.rows.map((plain) => {
        const line = sourceOf(plain);
        // A row is bound when the winning declaration reads a token, or the
        // session's edit attached one.
        const e = editOf(at(plain, s.label));
        const token = e
          ? e.to.token
          : line && line !== 'pending'
          ? (line.token as TokenName | undefined)
          : undefined;
        const r =
          token === plain.value.token
            ? plain
            : { ...plain, value: { ...plain.value, token } };
        const t = at(r, s.label);
        return field(
          `${s.id}:${r.id}`,
          r,
          t,
          {
            commit: (typed, exact) => commit(t, typed, exact),
            attach: (token) => bind(t, token),
            detach: () => detach(t),
          },
          line
        );
      })}
    </InspSection>
  );
  const sections = (inspection?.sections ?? []).filter(
    (s) => s.rows.length > 0 || s.add
  );
  // Selection colours sit where Figma has them: after Stroke, before
  // Effects.
  const beforeColours = sections.filter((s) => s.id !== 'effects');
  const afterColours = sections.filter((s) => s.id === 'effects');

  return (
    <div className="wb-insp" data-testid="wb-panel-design">
      <section
        className="wb-insp-block wb-insp-prop"
        data-testid="wb-insp-selection"
      >
        {selected ? (
          <>
            <button
              type="button"
              className="wb-insp-layer"
              data-testid="wb-insp-layer"
              aria-haspopup="menu"
              aria-expanded={ancestors}
              aria-label={`Layer ${labelOf(selected)}. Select a parent`}
              onClick={() => setAncestors((a) => !a)}
            >
              <Icon
                name={inspection ? KIND_GLYPH[inspection.kind] : 'layers'}
                size={14}
              />
              <span className="wb-insp-layer-name">{labelOf(selected)}</span>
              <Icon name="chevron" size={14} />
            </button>
            <SourceHead
              trace={
                trace && trace.el === selected && trace.key === longKey
                  ? trace.t
                  : undefined
              }
            />
            {ancestors && (
              <ul
                className="wb-insp-ancestors"
                role="menu"
                aria-label="Parents"
              >
                {up.map((el, i) => (
                  <li key={i} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        pick(el);
                        setAncestors(false);
                      }}
                    >
                      <Icon name="up" size={14} />
                      {labelOf(el)}
                    </button>
                  </li>
                ))}
                {up.length === 0 && (
                  <li role="none" className="wb-insp-hint">
                    <Icon name="minus" size={14} />
                  </li>
                )}
              </ul>
            )}
          </>
        ) : (
          <p className="wb-insp-hint" aria-label="Nothing selected">
            <Icon name="pointer" size={14} />
          </p>
        )}
      </section>

      {props}

      {beforeColours.map(sectionOf)}

      {colours.length > 0 && (
        <InspSection
          id="selection-colours"
          title="Selection colours"
          count={colours.length}
        >
          {coloursShown.map((g) => {
            const r = colourRow(g);
            // The group's own row stands for its first use: the custom mark
            // shows when that one is a custom value.
            const first = g.uses.map(useTarget).find(Boolean) as
              | Target
              | undefined;
            return field(
              `selection-colours:${g.key}`,
              r,
              first ?? { path: null, row: r, group: 'Fill' },
              {
                commit: (typed, exact) => {
                  let ok = true;
                  eachUse(g, (t) => {
                    ok = commit(t, typed, exact) && ok;
                  });
                  return ok;
                },
                attach: (token) => eachUse(g, (t) => bind(t, token)),
                detach: () => eachUse(g, detach),
              }
            );
          })}
          {!coloursAll && colours.length > COLOURS_FIRST && (
            <button
              type="button"
              className="wb-controls-more wb-insp-full"
              onClick={() => setColoursAll(true)}
            >
              {`Show all ${colours.length}`}
            </button>
          )}
        </InspSection>
      )}

      {afterColours.map(sectionOf)}

      {also.length > 0 && (
        <InspSection
          id="also"
          title="Also in this file"
          count={also.length}
          defaultOpen={false}
        >
          {alsoShown.map((f) => {
            const token = healToken(f, meta)[0];
            return (
              <div
                key={`${f.line}:${f.col}`}
                className="wb-also-row"
                data-testid="wb-also-row"
              >
                <Icon
                  name={GLYPH_OF_FINDING[f.category] ?? 'tokens'}
                  size={14}
                />
                <code>{flatRaw(f.raw)}</code>
                <Icon name="arrow" size={12} />
                {token ? (
                  <code>{shortName(token)}</code>
                ) : (
                  <span className="wb-muted">choose</span>
                )}
                <button
                  type="button"
                  className="wb-icon-button wb-insp-action"
                  data-testid="wb-also-heal"
                  aria-label={`Heal line ${f.line}`}
                  onClick={() => healFile(f)}
                >
                  <Icon name="heal" size={14} />
                </button>
              </div>
            );
          })}
          {!alsoAll && also.length > ALSO_FIRST && (
            <button
              type="button"
              className="wb-controls-more wb-insp-full"
              onClick={() => setAlsoAll(true)}
            >
              {`Show all ${also.length}`}
            </button>
          )}
        </InspSection>
      )}
    </div>
  );
};

export default Design;
