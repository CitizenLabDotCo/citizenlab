import { ReactNode, useEffect, useMemo, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import Icon, { IconName } from '../components/Icon';
import InspSection from '../components/InspSection';
import TokenPicker from '../components/TokenPicker';
import { ValueField } from '../components/ValueField';
import { resolveTokens } from '../lib/contrast';
import type { Finding, TokenMeta } from '../lib/data';
import { editId, ElementEdit, valueFits } from '../lib/elementEdits';
import { healToken, isHealable } from '../lib/healTask';
import { chainOf, componentOf, headerInstanceOf } from '../lib/nesting';
import {
  fitsProp,
  Inspection,
  InspectRow,
  inspectElement,
  defaultTarget,
  labelOf,
  parentTarget,
  pathOf,
  shortName,
} from '../lib/inspect';
import type { Overrides } from '../lib/overrides';
import { snapValue } from '../lib/overrides';
import { pickerGroups } from '../lib/tokenPicker';
import { DEFS } from '../lib/tokenValues';

import Controls from './Controls';

type Selection = {
  selected: Element | null;
  version: number;
  pick: (el: Element | null) => void;
  label?: string;
};

type Props = {
  storyId: string;
  // The story's component, the layer path's first segment.
  componentName: string;
  frames: (Window | null)[];
  selection: Selection;
  // What the instance header says of a library component by name.
  instanceInfo: (name: string) => {
    uses?: number;
    hasStory: boolean;
    // The component of this page.
    self: boolean;
  };
  // Open the page of the library component `instance` is the root of.
  onOpen: (instance: Element) => void;
  meta: TokenMeta[];
  mode: Mode;
  // Token overrides, for live values.
  overrides: Overrides;
  edits: ElementEdit[];
  addEdit: (e: ElementEdit) => void;
  removeEdit: (id: string) => void;
  // The component file's findings (fileFindings).
  findings: Finding[];
  // Shown under the instance header: its instance properties.
  instanceExtra?: (instance: Element, name: string, self: boolean) => ReactNode;
  // Changes when the canvas renders anew in place (an instance prop).
  revision?: number;
};

// Pauses after a render or an edit before the selection is read again.
const SETTLE_MS = [60, 600];
// "Also in this file" rows shown before "Show all".
const ALSO_FIRST = 12;
// Rows whose typed bare number is a length in px.
const PX_ROWS = new Set(['size', 'ls', 'stroke-width']);

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
  componentName,
  frames,
  selection,
  instanceInfo,
  onOpen,
  meta,
  mode,
  overrides,
  edits,
  addEdit,
  removeEdit,
  findings,
  instanceExtra,
  revision,
}: Props) => {
  const frame = frames[0];
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [picker, setPicker] = useState<string | undefined>();
  const [ancestors, setAncestors] = useState(false);
  const [alsoAll, setAlsoAll] = useState(false);
  const { selected, version, pick } = selection;
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const resolved = live[mode];

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
        setInspection(
          inspectElement(selected, meta, fontCheck(frame.document))
        );
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
  }, [selected, version, frame, meta, overrides, edits, mode, revision]);
  useEffect(() => {
    setPicker(undefined);
    setAncestors(false);
  }, [selected]);

  const path = selected ? pathOf(selected) : null;
  const editOf = (row: InspectRow) =>
    edits.find((e) => e.id === editId(storyId, path, row.id));
  // What the row was before the session touched it: the first edit keeps it.
  const originOf = (row: InspectRow): ElementEdit['from'] =>
    editOf(row)?.from ?? {
      raw: row.value.raw,
      shown: row.value.shown,
      token:
        row.value.link === 'linked' || row.value.link === 'theme'
          ? row.value.token
          : undefined,
    };
  // The property a row belongs to: Layout holds padding and gap rows.
  const groupOf = (row: InspectRow, sectionLabel: string) =>
    row.id.startsWith('padding')
      ? 'Padding'
      : row.id.startsWith('gap')
      ? 'Gap'
      : sectionLabel;
  const base = (row: InspectRow, sectionLabel: string) => ({
    id: editId(storyId, path, row.id),
    storyId,
    path,
    rowId: row.id,
    label:
      row.label && row.label !== groupOf(row, sectionLabel)
        ? `${groupOf(row, sectionLabel)} · ${row.label}`
        : groupOf(row, sectionLabel),
    glyph: row.glyph,
    props: row.props,
    from: originOf(row),
    at: Date.now(),
  });
  // A token for the row: an attach when the row started as a text value,
  // a swap when it started bound. Back to where it started = no edit.
  const bind = (row: InspectRow, sectionLabel: string, token: TokenName) => {
    const from = originOf(row);
    // A city value read through the theme: attaching its own token is the
    // heal (read the variable), drawn the same.
    if (
      !editOf(row) &&
      row.value.link === 'theme' &&
      row.value.token === token
    ) {
      addEdit({
        ...base(row, sectionLabel),
        from: { raw: from.raw, shown: from.shown },
        to: { value: resolved[token] ?? row.value.raw, token },
        kind: 'attach',
      });
      return;
    }
    if (from.token === token) {
      removeEdit(editId(storyId, path, row.id));
      return;
    }
    addEdit({
      ...base(row, sectionLabel),
      to: { value: resolved[token] ?? row.value.raw, token },
      kind: from.token ? 'swap' : 'attach',
    });
  };
  const detach = (row: InspectRow, sectionLabel: string) => {
    const from = originOf(row);
    // A pill the session attached goes back to its text value.
    if (!from.token && editOf(row)) {
      removeEdit(editId(storyId, path, row.id));
      return;
    }
    addEdit({
      ...base(row, sectionLabel),
      to: { value: row.value.raw },
      kind: 'detach',
    });
  };
  const commit = (
    row: InspectRow,
    sectionLabel: string,
    typed: string,
    exact = false
  ): boolean => {
    const bare = /^-?\d+(\.\d+)?$/.test(typed);
    const length =
      (row.snap === 'space' || row.snap === 'radius' || PX_ROWS.has(row.id)) &&
      bare;
    let value = length ? `${typed}px` : typed;
    if (row.snap === 'color' && /^[0-9a-f]{3,8}$/i.test(value)) {
      value = `#${value}`;
    }
    if (!valueFits(row.id, value)) return false;
    // An arrow step lands where it points, off the scale or not; back where
    // the row started it is no edit.
    if (exact) {
      if (value === originOf(row).raw) {
        if (editOf(row)) removeEdit(editId(storyId, path, row.id));
      } else {
        addEdit({ ...base(row, sectionLabel), to: { value }, kind: 'custom' });
      }
      return true;
    }
    const r = snapValue(row.snap, value, meta, mode);
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
    if (token) bind(row, sectionLabel, token);
    else {
      addEdit({ ...base(row, sectionLabel), to: { value }, kind: 'custom' });
    }
    return true;
  };

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
  const chain = selected ? chainOf(selected, componentName) : [];
  const instance = headerInstanceOf(selected);
  const instanceName = instance ? componentOf(instance) : null;
  const info = instanceName ? instanceInfo(instanceName) : null;
  // The story segment selects the story's root when it has no tagged one.
  const pickStory = (el: Element | null) => {
    if (el) pick(el);
    else if (frame) {
      try {
        pick(defaultTarget(frame.document));
      } catch {
        // The frame is gone; the next one selects its default.
      }
    }
  };

  return (
    <div className="wb-insp" data-testid="wb-panel-design">
      <section
        className="wb-insp-block wb-insp-prop"
        data-testid="wb-insp-selection"
      >
        {selected ? (
          <>
            <nav
              className="wb-chain"
              aria-label="Layer path"
              tabIndex={-1}
              data-testid="wb-insp-chain"
            >
              <ol>
                {chain.map((seg, i) => {
                  const glyph =
                    seg.kind === 'instance' ? (
                      <span className="wb-chain-glyph" aria-hidden="true">
                        ◇
                      </span>
                    ) : null;
                  return (
                    <li
                      key={i}
                      className={`wb-chain-seg wb-chain-${seg.kind}`}
                      data-kind={seg.kind}
                    >
                      {i > 0 && (
                        <span className="wb-chain-sep" aria-hidden="true">
                          ›
                        </span>
                      )}
                      {seg.current ? (
                        <span
                          className="wb-chain-name"
                          aria-current="location"
                          title={seg.name}
                        >
                          {glyph}
                          {seg.name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="wb-chain-name"
                          title={seg.name}
                          aria-label={`Select ${seg.name}`}
                          onClick={() =>
                            seg.kind === 'story'
                              ? pickStory(seg.el)
                              : pick(seg.el)
                          }
                        >
                          {glyph}
                          {seg.name}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <button
              type="button"
              className="wb-insp-layer"
              data-testid="wb-insp-layer"
              aria-haspopup="menu"
              aria-expanded={ancestors}
              aria-label={`Layer ${labelOf(selected)}. Select a parent`}
              onClick={() => setAncestors((a) => !a)}
            >
              <Icon name="layers" size={14} />
              <span className="wb-insp-layer-name">{labelOf(selected)}</span>
              <Icon name="chevron" size={14} />
            </button>
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

      {instance && instanceName && info && (
        <section
          className="wb-insp-block wb-instance"
          data-testid="wb-insp-instance"
          data-component={instanceName}
        >
          <span className="wb-instance-glyph" aria-hidden="true">
            ◇
          </span>
          <span className="wb-instance-name">{instanceName}</span>
          <span className="wb-instance-uses">
            {info.uses === undefined
              ? 'Usage not scanned'
              : `${info.uses} ${info.uses === 1 ? 'use' : 'uses'}`}
          </span>
          {info.self ? null : info.hasStory ? (
            <button
              type="button"
              className="wb-instance-open"
              data-testid="wb-insp-open"
              aria-label={`Open ${instanceName}`}
              onClick={() => onOpen(instance)}
            >
              Open
              <Icon name="arrow" size={12} />
            </button>
          ) : (
            <span className="wb-instance-none" data-testid="wb-insp-no-story">
              No story yet
            </span>
          )}
        </section>
      )}
      {instance && instanceName && info && instanceExtra && (
        <section
          className="wb-insp-block wb-instance-body"
          data-testid="wb-insp-instance-props"
        >
          {instanceExtra(instance, instanceName, info.self)}
        </section>
      )}

      {inspection?.sections
        .filter((s) => s.rows.length > 0)
        .map((s) => (
          <InspSection key={s.id} id={s.id} title={s.label}>
            {s.rows.map((r) => {
              const key = `${s.id}:${r.id}`;
              return (
                <div
                  key={key}
                  className={
                    r.half ? 'wb-insp-prop' : 'wb-insp-prop wb-insp-full'
                  }
                >
                  <ValueField
                    row={r}
                    liveToken={
                      r.value.token ? resolved[r.value.token] : undefined
                    }
                    edit={editOf(r)}
                    onCommit={(typed, exact) =>
                      commit(r, s.label, typed, exact)
                    }
                    onAttach={(token) => bind(r, s.label, token)}
                    onDetach={() => detach(r, s.label)}
                    onOpenPicker={() =>
                      setPicker(picker === key ? undefined : key)
                    }
                  />
                  {picker === key && (
                    <TokenPicker
                      row={r}
                      meta={meta}
                      resolved={resolved}
                      onPick={(token) => {
                        bind(r, s.label, token);
                        setPicker(undefined);
                      }}
                      onClose={() => setPicker(undefined)}
                    />
                  )}
                </div>
              );
            })}
          </InspSection>
        ))}

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

      <details
        className="wb-insp-block wb-insp-props"
        data-testid="wb-insp-props"
      >
        <summary className="wb-insp-head">
          <h3>Props</h3>
          <Icon name="chevron" size={14} />
        </summary>
        <Controls storyId={storyId} frames={frames} />
      </details>
    </div>
  );
};

export default Design;
