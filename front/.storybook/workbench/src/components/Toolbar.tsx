import type { Mode } from '@ds/tokens/tokens';

import { DEFAULT_CITY } from '../../../cities';
import { GV_VIEWPORTS, GvViewport } from '../../../viewports';
import type { FrameGlobals } from '../lib/frame';

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
  city: DEFAULT_CITY,
  lang: 'en',
  viewport: 'fit',
  zoom: 'fit',
};

export const VIEWPORTS: { value: CanvasViewport; label: string }[] = [
  { value: 'fit', label: 'Fit to story' },
  ...Object.entries(GV_VIEWPORTS).map(([v, vp]) => ({
    value: v as GvViewport,
    label: vp.name,
  })),
];

export const MODES: { value: Mode; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'redesign', label: 'Redesign' },
];

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
export const Field = ({
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
export const ZoomControl = ({
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
