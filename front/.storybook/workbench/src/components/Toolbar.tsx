import { ReactNode, useEffect, useRef, useState } from 'react';

import type { Mode } from '@ds/tokens/tokens';

import { cities } from '../../../cities';
import { LANGUAGES } from '../../../languages';
import { GV_VIEWPORTS, GvViewport } from '../../../viewports';
import { focusables, trapTab } from '../lib/focus';
import type { FrameGlobals } from '../lib/frame';
import { useToolbarHeight } from '../lib/useToolbarHeight';

import Icon from './Icon';

// `fit`: the frame is sized to the rendered story (see Canvas); the presets
// are for page-level checks.
export type CanvasViewport = GvViewport | 'fit';

// `fit` scales the frame to the canvas (small stories up, wide ones down);
// a number shows it at that scale, 1 being its true size.
export type Zoom = 'fit' | number;
export const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

export type ToolbarState = FrameGlobals & {
  viewport: CanvasViewport;
  zoom: Zoom;
};

export const DEFAULT_TOOLBAR: ToolbarState = {
  mode: 'today',
  city: 'default',
  lang: 'en',
  viewport: 'fit',
  zoom: 'fit',
};

const VIEWPORTS: { value: CanvasViewport; label: string }[] = [
  { value: 'fit', label: 'Fit to story' },
  ...Object.entries(GV_VIEWPORTS).map(([v, vp]) => ({
    value: v as GvViewport,
    label: vp.name,
  })),
];

const MODES: { value: Mode; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'redesign', label: 'Redesign' },
];

type Props = {
  value: ToolbarState;
  onChange: (next: ToolbarState) => void;
  // Set when the page shows both modes at once: the mode field is off,
  // reads "Both" and says why.
  modeLocked?: string;
  // Set when the story sets its own language: the field shows it, off.
  storyLang?: string;
  // The scale Fit came to, shown next to the zoom control.
  fitScale?: number;
  // Page tools at the end of the bar.
  children?: ReactNode;
};

type FieldProps = {
  id: keyof ToolbarState;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  title?: string;
};

// A select drawn as a compact dropdown button: the label is for screen
// readers and the tooltip, the value is what shows. The tooltip names the
// value too, as a narrow bar can cut it short.
const Field = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  title,
}: FieldProps) => (
  <label
    className={`wb-toolbar-field wb-toolbar-field-${id}`}
    title={
      title ??
      `${label}: ${options.find((o) => o.value === value)?.label ?? value}`
    }
  >
    <span className="wb-visually-hidden">{label}</span>
    <select
      data-testid={`wb-toolbar-${id}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <Icon name="chevron" size={14} />
  </label>
);

const percent = (z: number) => `${Math.round(z * 100)}%`;

// Fit, a fixed zoom, and a step down and up. The field says what Fit came
// to, so the true size (100%) is one pick away.
const ZoomControl = ({
  zoom,
  fitScale,
  onChange,
}: {
  zoom: Zoom;
  fitScale?: number;
  onChange: (z: Zoom) => void;
}) => {
  const current = zoom === 'fit' ? fitScale ?? 1 : zoom;
  const down = [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001);
  const up = ZOOM_STEPS.find((s) => s > current + 0.001);
  return (
    <div className="wb-zoom" role="group" aria-label="Zoom">
      <button
        type="button"
        className="wb-zoom-step"
        onClick={() => down && onChange(down)}
        disabled={!down}
        title="Zoom out"
      >
        <Icon name="minus" size={14} />
        <span className="wb-visually-hidden">Zoom out</span>
      </button>
      <label className="wb-toolbar-field" title="Zoom">
        <span className="wb-visually-hidden">Zoom</span>
        <select
          data-testid="wb-toolbar-zoom"
          value={zoom === 'fit' ? 'fit' : String(zoom)}
          onChange={(e) =>
            onChange(e.target.value === 'fit' ? 'fit' : Number(e.target.value))
          }
        >
          <option value="fit">
            {fitScale ? `Fit, ${percent(fitScale)}` : 'Fit'}
          </option>
          {ZOOM_STEPS.map((s) => (
            <option key={s} value={String(s)}>
              {percent(s)}
            </option>
          ))}
        </select>
        <Icon name="chevron" size={14} />
      </label>
      <button
        type="button"
        className="wb-zoom-step"
        onClick={() => up && onChange(up)}
        disabled={!up}
        title="Zoom in"
      >
        <Icon name="plus" size={14} />
        <span className="wb-visually-hidden">Zoom in</span>
      </button>
    </div>
  );
};

// Mode, city, viewport, language and zoom of the canvas. Mode, city and
// language go into the preview frame's globals; the viewport sizes the
// frame. On a phone the fields fold into one button that opens a sheet.
const Toolbar = ({
  value,
  onChange,
  modeLocked,
  storyLang,
  fitScale,
  children,
}: Props) => {
  const [sheet, setSheet] = useState(false);
  const sheetButton = useRef<HTMLButtonElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const barRef = useToolbarHeight();
  const closeSheet = () => {
    setSheet(false);
    sheetButton.current?.focus();
  };
  // The open sheet takes focus, keeps Tab inside, and hands focus back to
  // its button when it closes.
  useEffect(() => {
    if (!sheet) return undefined;
    focusables(fieldsRef.current)[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        trapTab(e, fieldsRef.current);
        return;
      }
      if (e.key !== 'Escape') return;
      setSheet(false);
      sheetButton.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheet]);
  const set =
    <K extends keyof ToolbarState>(key: K) =>
    (v: string) =>
      onChange({ ...value, [key]: v as ToolbarState[K] });
  const cityTitle =
    (cities as Record<string, { title: string } | undefined>)[value.city]
      ?.title ?? value.city;
  const viewportLabel =
    VIEWPORTS.find((v) => v.value === value.viewport)?.label ?? '';
  const lang = storyLang ?? value.lang;
  const langLabel =
    LANGUAGES.find((l) => l.value === lang)?.label ?? lang.toUpperCase();
  const languages: { value: string; label: string }[] = LANGUAGES.map(
    ({ value: v, label }) => ({
      value: v,
      label,
    })
  );
  if (!languages.some((l) => l.value === lang)) {
    languages.push({ value: lang, label: lang });
  }
  const summary = [
    modeLocked ? 'Both' : MODES.find((m) => m.value === value.mode)?.label,
    cityTitle,
    viewportLabel,
    value.zoom === 'fit' ? 'Fit' : percent(value.zoom),
  ].join(' · ');
  return (
    <div
      ref={barRef}
      className="wb-toolbar"
      role="toolbar"
      aria-label="Canvas"
      data-sheet={sheet ? 'open' : undefined}
    >
      <button
        type="button"
        className="wb-toolbar-summary"
        ref={sheetButton}
        aria-expanded={sheet}
        aria-controls="wb-toolbar-fields"
        onClick={() => setSheet((s) => !s)}
      >
        <span className="wb-toolbar-summary-label">Canvas</span>
        <span className="wb-toolbar-summary-value">{summary}</span>
        <Icon name="chevron" size={14} />
      </button>
      {sheet && (
        <button
          type="button"
          className="wb-toolbar-scrim"
          aria-label="Close canvas settings"
          tabIndex={-1}
          onClick={closeSheet}
        />
      )}
      <div className="wb-toolbar-fields" id="wb-toolbar-fields" ref={fieldsRef}>
        <p className="wb-toolbar-sheet-title">Canvas settings</p>
        <Field
          id="mode"
          label="Mode"
          value={modeLocked ? 'both' : value.mode}
          options={
            modeLocked ? [{ value: 'both', label: 'Both' }, ...MODES] : MODES
          }
          onChange={set('mode')}
          disabled={!!modeLocked}
          title={modeLocked ? `Mode: ${modeLocked}` : undefined}
        />
        <Field
          id="city"
          label="City"
          value={value.city}
          options={Object.entries(cities).map(([v, c]) => ({
            value: v,
            label: c.title,
          }))}
          onChange={set('city')}
        />
        <Field
          id="viewport"
          label="Viewport"
          value={value.viewport}
          options={VIEWPORTS}
          onChange={set('viewport')}
        />
        <Field
          id="lang"
          label="Language"
          value={lang}
          options={languages}
          onChange={set('lang')}
          disabled={!!storyLang}
          title={
            storyLang
              ? `Language: this story sets ${langLabel} itself.`
              : undefined
          }
        />
        <span className="wb-toolbar-sep" aria-hidden="true" />
        <ZoomControl
          zoom={value.zoom}
          fitScale={fitScale}
          onChange={(zoom) => onChange({ ...value, zoom })}
        />
      </div>
      {children && <div className="wb-toolbar-tools">{children}</div>}
    </div>
  );
};

export default Toolbar;
