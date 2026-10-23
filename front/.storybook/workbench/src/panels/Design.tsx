import { ReactNode, useEffect, useMemo, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import { cities } from '../../../cities';
import { LANGUAGES } from '../../../languages';
import ChangesDrawer from '../components/ChangesDrawer';
import Icon from '../components/Icon';
import { ColourPicker, toHex6, useTokenEdit } from '../components/tokenEdit';
import { MODE_LABEL } from '../components/TokenRow';
import { Field, MODES, ToolbarState, VIEWPORTS } from '../components/Toolbar';
import type { TokenMeta } from '../lib/data';
import {
  Inspection,
  InspectRow,
  InspectValue,
  inspectElement,
  parentTarget,
  shortName,
} from '../lib/inspect';
import type { Overrides } from '../lib/overrides';
import { plural } from '../lib/plural';
import type { Section, StoryRef } from '../lib/stories';
import type { TokenUsage } from '../lib/usage';

import Controls from './Controls';

type Selection = {
  selected: Element | null;
  version: number;
  pick: (el: Element | null) => void;
  label?: string;
};

type Props = {
  section: Section;
  storyId: string;
  states: StoryRef[];
  variants: StoryRef[];
  tabLabel: (s: StoryRef) => string;
  toolbar: ToolbarState;
  setToolbar: (next: ToolbarState) => void;
  // Set when both modes show side by side: the mode field is off.
  modeLocked?: string;
  // Set when the story sets its own language.
  storyLang?: string;
  frames: (Window | null)[];
  selection: Selection;
  meta: TokenMeta[];
  overrides: Overrides;
  setOverride: (name: TokenName, value: string) => string | undefined;
  reset: (name?: TokenName) => void;
  usage: Map<string, TokenUsage>;
  hasScan: boolean;
  // Opens the Inspect tab (the token list with its heal).
  onInspect: () => void;
};

// Pauses after a render or an edit before the selection is read again.
const SETTLE_MS = [60, 600];

// One block of the inspector: a heading, optional actions, its rows.
const Block = ({
  title,
  actions,
  children,
  testId,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  testId?: string;
}) => (
  <section className="wb-insp-block" data-testid={testId}>
    <header className="wb-insp-head">
      <h3>{title}</h3>
      {actions}
    </header>
    {children}
  </section>
);

// A labelled field in a block (State, City, Font...).
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="wb-insp-row">
    {label && <span className="wb-insp-label">{label}</span>}
    <div className="wb-insp-control">{children}</div>
  </div>
);

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

// The token a value comes from, edited in place: both modes, the field,
// the colour picker, its uses. The edit is the session's, listed in Changes.
const TokenEditor = ({
  token,
  meta,
  mode,
  override,
  usage,
  hasScan,
  onSet,
  onReset,
}: {
  token: TokenMeta;
  meta: TokenMeta[];
  mode: Mode;
  override?: string;
  usage?: TokenUsage;
  hasScan: boolean;
  onSet: (name: TokenName, value: string) => string | undefined;
  onReset: (name: TokenName) => void;
}) => {
  const name = token.name as TokenName;
  const { current, draft, setDraft, commit, feedback, setFeedback } =
    useTokenEdit({
      name,
      base: token.values[mode],
      override,
      meta,
      mode,
      onSet,
    });
  const hex = token.category === 'color' ? toHex6(current) : undefined;
  const differs = token.values.today !== token.values.redesign;
  const id = `wb-insp-edit-${name.slice(2)}`;
  return (
    <div className="wb-insp-editor" data-testid="wb-insp-editor">
      <code className="wb-insp-editor-name">{name}</code>
      {token.description && (
        <p className="wb-insp-editor-note">{token.description}</p>
      )}
      <dl className="wb-insp-modes">
        {(['today', 'redesign'] as Mode[]).map((m) => (
          <div key={m} className={m === mode ? 'wb-insp-mode-on' : undefined}>
            <dt>{MODE_LABEL[m]}</dt>
            <dd>
              {token.values[m]}
              {m === 'redesign' && differs && (
                <span className="wb-diff-dot" title="Differs from Today" />
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="wb-token-edit">
        <label className="wb-visually-hidden" htmlFor={id}>
          {`New value for ${name}`}
        </label>
        <input
          id={id}
          data-testid="wb-insp-input"
          value={draft}
          spellCheck={false}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(e.currentTarget.value);
            if (e.key === 'Escape') setDraft(current);
          }}
        />
        {hex && (
          <ColourPicker
            label={`Pick a colour for ${name}`}
            value={hex}
            onPreview={setDraft}
            onCommit={commit}
          />
        )}
        {override !== undefined && (
          <button
            type="button"
            onClick={() => {
              onReset(name);
              setFeedback(undefined);
            }}
          >
            Reset
          </button>
        )}
      </div>
      {feedback && (
        <div
          className={`wb-token-feedback wb-token-feedback-${feedback.kind}`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </div>
      )}
      <p className="wb-insp-editor-note">
        {!hasScan
          ? 'No scan loaded.'
          : usage
          ? `${plural(usage.count, 'use', 'uses')} in ${plural(
              usage.components,
              'place',
              'places'
            )}, ${plural(usage.routes, 'page', 'pages')}`
          : 'Not used in the code yet.'}
      </p>
    </div>
  );
};

const LINK_TITLE = {
  linked: 'From this token',
  equal: 'Hard-coded: equals this token, but the code does not use it',
};

// One value as Figma shows it: a token chip when it comes from a token, a
// dashed chip when it only equals one, the bare value otherwise. A chip
// opens its editor.
const ValueField = ({
  row,
  open,
  onToggle,
}: {
  row: InspectRow;
  open: boolean;
  onToggle: () => void;
}) => {
  const v: InspectValue = row.value;
  const swatch = v.swatch && (
    <span
      className="wb-insp-swatch"
      style={{ background: v.swatch }}
      aria-hidden="true"
    />
  );
  if (!v.token) {
    return (
      <div
        className="wb-insp-value"
        data-testid="wb-insp-value"
        data-link="none"
        title={`${v.raw}: not a token`}
      >
        {swatch}
        <span className="wb-insp-text">{v.shown}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="wb-insp-value wb-insp-token"
      data-testid="wb-insp-value"
      data-link={v.link}
      data-token={v.token}
      aria-expanded={open}
      title={`${LINK_TITLE[v.link ?? 'linked']}: ${v.token} (${v.raw})`}
      onClick={onToggle}
    >
      {swatch ?? <Icon name="tokens" size={14} />}
      <span className="wb-insp-text">{shortName(v.token)}</span>
      {v.link === 'equal' && (
        <span className="wb-diff-dot wb-insp-equal" aria-label="hard-coded" />
      )}
      <span className="wb-insp-raw">{v.shown}</span>
    </button>
  );
};

// The Design tab: what the canvas shows (story, mode, city, viewport,
// language), the selected element's properties with the tokens they come
// from, and the story's props.
const Design = ({
  section,
  storyId,
  states,
  variants,
  tabLabel,
  toolbar,
  setToolbar,
  modeLocked,
  storyLang,
  frames,
  selection,
  meta,
  overrides,
  setOverride,
  reset,
  usage,
  hasScan,
  onInspect,
}: Props) => {
  const frame = frames[0];
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [open, setOpen] = useState<string | undefined>();
  const [drawer, setDrawer] = useState(false);
  const byName = useMemo(() => new Map(meta.map((t) => [t.name, t])), [meta]);
  const { selected, version, pick } = selection;

  // Read the selection after it changes, renders, or a token is edited;
  // again once the frame settles (the city's tenant tokens are written
  // after the first render) and whenever a web font finishes loading.
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
  }, [selected, version, frame, meta, overrides, toolbar.mode]);
  useEffect(() => setOpen(undefined), [selected]);

  const go = (id: string) => {
    window.location.hash = `#/${section}/${encodeURIComponent(id)}`;
  };
  const inStates = states.some((s) => s.id === storyId);
  const inVariants = variants.some((s) => s.id === storyId);
  const set =
    <K extends keyof ToolbarState>(key: K) =>
    (v: string) =>
      setToolbar({ ...toolbar, [key]: v as ToolbarState[K] });
  const lang = storyLang ?? toolbar.lang;
  const languages: { value: string; label: string }[] = LANGUAGES.map(
    ({ value, label }) => ({ value, label })
  );
  if (!languages.some((l) => l.value === lang)) {
    languages.push({ value: lang, label: lang });
  }
  const edits = Object.keys(overrides).length;
  const up = selected ? parentTarget(selected) : null;
  const changesButton = (
    <button
      type="button"
      className="wb-changes-toggle wb-icon-button"
      data-testid="wb-changes-toggle"
      aria-expanded={drawer}
      onClick={() => setDrawer((d) => !d)}
    >
      <Icon name="edit" size={14} />
      Changes
      <span className={edits > 0 ? 'wb-count wb-count-on' : 'wb-count'}>
        {edits}
      </span>
    </button>
  );

  return (
    <div className="wb-insp" data-testid="wb-panel-design">
      <Block title="Component" testId="wb-insp-story" actions={changesButton}>
        {drawer && (
          <ChangesDrawer
            meta={meta}
            mode={toolbar.mode}
            overrides={overrides}
            onReset={reset}
            onClose={() => setDrawer(false)}
          />
        )}

        {states.length > 0 && (
          <Row label="State">
            <StorySelect
              id="state"
              stories={states}
              value={inStates ? storyId : ''}
              tabLabel={tabLabel}
              onChange={go}
            />
          </Row>
        )}
        {variants.length > 0 && (
          <Row label={states.length > 0 ? 'Variant' : 'Story'}>
            <StorySelect
              id="variant"
              stories={variants}
              value={inVariants ? storyId : ''}
              tabLabel={tabLabel}
              onChange={go}
            />
          </Row>
        )}
      </Block>

      <Block title="Canvas">
        <Row label="Mode">
          <Field
            id="mode"
            label="Mode"
            value={modeLocked ? 'both' : toolbar.mode}
            options={
              modeLocked ? [{ value: 'both', label: 'Both' }, ...MODES] : MODES
            }
            onChange={set('mode')}
            disabled={!!modeLocked}
            title={modeLocked ? `Mode: ${modeLocked}` : undefined}
          />
        </Row>
        <Row label="City">
          <Field
            id="city"
            label="City"
            value={toolbar.city}
            options={Object.entries(cities).map(([v, c]) => ({
              value: v,
              label: c.title,
            }))}
            onChange={set('city')}
          />
        </Row>
        <Row label="Viewport">
          <Field
            id="viewport"
            label="Viewport"
            value={toolbar.viewport}
            options={VIEWPORTS}
            onChange={set('viewport')}
          />
        </Row>
        <Row label="Language">
          <Field
            id="lang"
            label="Language"
            value={lang}
            options={languages}
            onChange={set('lang')}
            disabled={!!storyLang}
            title={
              storyLang ? 'Language: this story sets it itself.' : undefined
            }
          />
        </Row>
      </Block>

      <Block
        title="Selection"
        testId="wb-insp-selection"
        actions={
          <button
            type="button"
            className="wb-icon-button wb-insp-action"
            onClick={() => up && pick(up)}
            disabled={!up}
            title="Select the parent (Esc)"
            aria-label="Select the parent"
          >
            <Icon name="up" size={14} />
          </button>
        }
      >
        {inspection ? (
          <>
            <div className="wb-insp-layer">
              <span className="wb-insp-layer-name">{inspection.label}</span>
              <span className="wb-insp-layer-size">
                {`W ${inspection.size.w}  H ${inspection.size.h}`}
              </span>
            </div>
            <p className="wb-insp-key">
              <span className="wb-insp-key-chip" aria-hidden="true" />
              from a token
              <span
                className="wb-insp-key-chip wb-insp-key-equal"
                aria-hidden="true"
              >
                <span className="wb-diff-dot" />
              </span>
              hard-coded, equals a token
            </p>
          </>
        ) : (
          <p className="wb-insp-hint">
            Click an element on the canvas to see its tokens.
          </p>
        )}
      </Block>

      {inspection?.sections.map((s) => (
        <Block key={s.id} title={s.label} testId={`wb-insp-${s.id}`}>
          {s.rows.map((r) => {
            const key = `${s.id}:${r.id}`;
            const token = r.value.token ? byName.get(r.value.token) : undefined;
            const isOpen = open === key && !!token;
            return (
              <div key={key} className="wb-insp-prop">
                <Row label={r.label}>
                  <ValueField
                    row={r}
                    open={isOpen}
                    onToggle={() => setOpen(isOpen ? undefined : key)}
                  />
                </Row>
                {isOpen && token && r.value.link === 'equal' && (
                  <p className="wb-insp-editor-note wb-insp-heal">
                    {`The code sets ${r.value.shown} by hand; it equals ${token.name}. `}
                    <button
                      type="button"
                      className="wb-link-button"
                      onClick={onInspect}
                    >
                      Heal it in Inspect
                    </button>
                  </p>
                )}
                {isOpen && token && (
                  <TokenEditor
                    token={token}
                    meta={meta}
                    mode={toolbar.mode}
                    override={overrides[token.name as TokenName]}
                    usage={usage.get(token.name)}
                    hasScan={hasScan}
                    onSet={setOverride}
                    onReset={reset}
                  />
                )}
              </div>
            );
          })}
        </Block>
      ))}

      <details className="wb-insp-block wb-insp-props" open>
        <summary className="wb-insp-head">
          <h3>Props</h3>
          <Icon name="chevron" size={14} />
        </summary>
        <Controls storyId={storyId} frames={frames} />
      </details>
    </div>
  );
};

const StorySelect = ({
  id,
  stories,
  value,
  tabLabel,
  onChange,
}: {
  id: string;
  stories: StoryRef[];
  value: string;
  tabLabel: (s: StoryRef) => string;
  onChange: (id: string) => void;
}) => (
  <label className="wb-toolbar-field wb-toolbar-field-story">
    <span className="wb-visually-hidden">{id}</span>
    <select
      data-testid={`wb-insp-${id}`}
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
    >
      {!value && <option value="">Choose…</option>}
      {stories.map((s) => (
        <option key={s.id} value={s.id}>
          {tabLabel(s)}
        </option>
      ))}
    </select>
    <Icon name="chevron" size={14} />
  </label>
);

export default Design;
