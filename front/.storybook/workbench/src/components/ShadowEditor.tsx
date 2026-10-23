import { useEffect, useState } from 'react';

import { stepNumber, stepOfKey } from '../lib/nudge';
import {
  formatShadow,
  NEW_LAYER,
  parseShadow,
  ShadowLayer,
} from '../lib/shadow';

import Icon from './Icon';
import { ColourPicker } from './tokenEdit';

// A number with its unit, as the Design tab's fields: arrows step it, a
// typed number applies as it is typed.
const NumberField = ({
  field,
  label,
  short,
  unit,
  value,
  min,
  max,
  onValue,
}: {
  field: string;
  label: string;
  short?: string;
  unit: string;
  value: number;
  min?: number;
  max?: number;
  onValue: (n: number) => void;
}) => {
  const [draft, setDraft] = useState(String(value));
  // A half typed number ("1.", "-") stays while it means the same value.
  useEffect(
    () => setDraft((d) => (d.trim() && Number(d) === value ? d : `${value}`)),
    [value]
  );
  const fit = (n: number) =>
    Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  return (
    <label className="wb-vf wb-sh-field" data-field={field}>
      {short && (
        <span className="wb-sh-key" aria-hidden="true">
          {short}
        </span>
      )}
      <input
        aria-label={label}
        inputMode="decimal"
        value={draft}
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value.trim() && Number.isFinite(n)) onValue(fit(n));
        }}
        onBlur={() => setDraft(`${value}`)}
        onKeyDown={(e) => {
          const step = stepOfKey(e);
          if (step) {
            e.preventDefault();
            onValue(fit(stepNumber(value, step, min)));
          }
          if (e.key === 'Escape') setDraft(`${value}`);
        }}
      />
      <span className="wb-sh-unit" aria-hidden="true">
        {unit}
      </span>
    </label>
  );
};

// The colour's hex without its #, applied once it is a whole colour.
const HexField = ({
  label,
  value,
  onValue,
}: {
  label: string;
  value: string;
  onValue: (hex: string) => void;
}) => {
  const bare = value.replace(/^#/, '');
  const [draft, setDraft] = useState(bare);
  useEffect(() => setDraft(bare), [bare]);
  return (
    <input
      className="wb-sh-hex"
      aria-label={label}
      value={draft}
      maxLength={7}
      spellCheck={false}
      onChange={(e) => {
        const typed = e.target.value.replace(/^#/, '');
        setDraft(typed);
        if (/^[0-9a-f]{6}$/i.test(typed)) onValue(`#${typed.toLowerCase()}`);
      }}
      onBlur={(e) => {
        const typed = e.target.value.replace(/^#/, '');
        if (/^[0-9a-f]{3}$/i.test(typed)) {
          onValue(`#${[...typed.toLowerCase()].map((c) => c + c).join('')}`);
        } else setDraft(bare);
      }}
    />
  );
};

// The layers of a box-shadow token, as Figma's shadow popover lays them
// out: a drop or inner shadow per layer with its position, blur, spread
// and colour. Every change writes the whole box-shadow back, so it
// previews as a typed value does. A value it cannot read draws nothing;
// the text field stays the way to edit it.
const ShadowEditor = ({
  name,
  value,
  onApply,
}: {
  name: string;
  value: string;
  onApply: (value: string) => void;
}) => {
  const layers = parseShadow(value);
  if (!layers) return null;
  const write = (next: ShadowLayer[]) => onApply(formatShadow(next));
  const set = (i: number, patch: Partial<ShadowLayer>) =>
    write(layers.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div
      className="wb-sh"
      data-testid="wb-shadow-editor"
      role="group"
      aria-label={`Shadow layers of ${name}`}
    >
      {layers.length === 0 && <p className="wb-sh-empty">No shadow</p>}
      {layers.map((l, i) => {
        const of = layers.length > 1 ? ` ${i + 1}` : '';
        return (
          <div
            key={i}
            className="wb-sh-layer"
            data-testid="wb-shadow-layer"
            data-inset={l.inset || undefined}
          >
            <div className="wb-sh-head">
              <span className="wb-sh-kind">
                <Icon name="shadow" size={14} />
                <select
                  aria-label={`Type of layer${of}`}
                  value={l.inset ? 'inner' : 'drop'}
                  onChange={(e) =>
                    set(i, { inset: e.target.value === 'inner' })
                  }
                >
                  <option value="drop">Drop shadow</option>
                  <option value="inner">Inner shadow</option>
                </select>
                <Icon name="chevron" size={14} />
              </span>
              <button
                type="button"
                className="wb-sh-remove"
                data-testid="wb-shadow-remove"
                aria-label={`Remove layer${of}`}
                onClick={() => write(layers.filter((_, j) => j !== i))}
              >
                <Icon name="minus" size={14} />
              </button>
            </div>
            <div className="wb-sh-grid">
              <NumberField
                field="x"
                label={`Position X${of}`}
                short="X"
                unit="px"
                value={l.x}
                onValue={(x) => set(i, { x })}
              />
              <NumberField
                field="y"
                label={`Position Y${of}`}
                short="Y"
                unit="px"
                value={l.y}
                onValue={(y) => set(i, { y })}
              />
              <NumberField
                field="blur"
                label={`Blur${of}`}
                short="Blur"
                unit="px"
                value={l.blur}
                min={0}
                onValue={(blur) => set(i, { blur })}
              />
              <NumberField
                field="spread"
                label={`Spread${of}`}
                short="Spread"
                unit="px"
                value={l.spread}
                onValue={(spread) => set(i, { spread })}
              />
              <div className="wb-vf wb-sh-colour" data-field="color">
                <ColourPicker
                  label={`Colour${of}`}
                  value={l.color}
                  onPreview={(color) => set(i, { color })}
                  onCommit={(color) => set(i, { color })}
                />
                <HexField
                  label={`Colour hex${of}`}
                  value={l.color}
                  onValue={(color) => set(i, { color })}
                />
              </div>
              <NumberField
                field="alpha"
                label={`Opacity${of}`}
                unit="%"
                value={l.alpha}
                min={0}
                max={100}
                onValue={(alpha) => set(i, { alpha })}
              />
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className="wb-sh-add"
        data-testid="wb-shadow-add"
        onClick={() => write([...layers, NEW_LAYER])}
      >
        <Icon name="plus" size={14} />
        Add shadow
      </button>
    </div>
  );
};

export default ShadowEditor;
