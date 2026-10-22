import type { ReactNode } from 'react';

import type { Mode } from '@ds/tokens/tokens';

import { cities } from '../../../cities';
import { LANGUAGES } from '../../../languages';
import { GV_VIEWPORTS, GvViewport } from '../../../viewports';
import type { FrameGlobals } from '../lib/frame';

export type ToolbarState = FrameGlobals & { viewport: GvViewport };

export const DEFAULT_TOOLBAR: ToolbarState = {
  mode: 'today',
  city: 'default',
  lang: 'en',
  viewport: 'gvDesktop',
};

const MODES: { value: Mode; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'redesign', label: 'Redesign' },
];

type Props = {
  value: ToolbarState;
  onChange: (next: ToolbarState) => void;
  // Set when the page shows both modes at once: the mode field is off and
  // says why.
  modeLocked?: string;
  // Page tools at the end of the bar.
  children?: ReactNode;
};

type FieldProps = {
  id: keyof ToolbarState | 'state';
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  title?: string;
};

const Field = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  title,
}: FieldProps) => (
  <label className="wb-toolbar-field" title={title}>
    <span>{label}</span>
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
  </label>
);

// Mode, city, viewport and language of the canvas. Mode, city and language
// go into the preview frame's globals; the viewport sizes the frame.
const Toolbar = ({ value, onChange, modeLocked, children }: Props) => {
  const set =
    <K extends keyof ToolbarState>(key: K) =>
    (v: string) =>
      onChange({ ...value, [key]: v as ToolbarState[K] });
  return (
    <div className="wb-toolbar" role="toolbar" aria-label="Canvas">
      <Field
        id="mode"
        label="Mode"
        value={value.mode}
        options={MODES}
        onChange={set('mode')}
        disabled={!!modeLocked}
        title={modeLocked}
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
        options={Object.entries(GV_VIEWPORTS).map(([v, vp]) => ({
          value: v,
          label: vp.name,
        }))}
        onChange={set('viewport')}
      />
      <Field
        id="lang"
        label="Language"
        value={value.lang}
        options={LANGUAGES.map(({ value: v, label }) => ({ value: v, label }))}
        onChange={set('lang')}
      />
      <Field
        id="state"
        label="State"
        value="none"
        options={[{ value: 'none', label: 'Live' }]}
        disabled
        title="Locking hover, focus and active comes in a later version."
      />
      {children && <div className="wb-toolbar-tools">{children}</div>}
    </div>
  );
};

export default Toolbar;
