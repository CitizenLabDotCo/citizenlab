import type {
  InstanceEdit,
  InstanceReport,
  PropSpec,
  PropValue,
} from '../lib/instanceProps';
import { valueText } from '../lib/instanceProps';

import Icon from './Icon';

type Props = {
  // The library component and the story it sits in.
  name: string;
  storyName: string;
  // This page's own component: its props are the main component's.
  self: boolean;
  report?: InstanceReport;
  // Undefined while the component's argTypes load.
  specs?: PropSpec[];
  edits: InstanceEdit[];
  onSet: (prop: string, value: PropValue) => void;
  onReset: (edit: InstanceEdit) => void;
};

type Mark = 'changed' | 'code' | 'default';

const MARK_TEXT: Record<Mark, string> = {
  changed: 'Changed here',
  code: 'Set in code',
  default: 'Default',
};

const MARK_SHORT: Record<Mark, string> = {
  changed: 'Changed',
  code: 'Code',
  default: 'Default',
};

// `buttonStyle` reads as "Button style".
const labelOf = (prop: string) =>
  prop
    .replace(/(?<=[a-z])([A-Z])/g, ' $1')
    .replace(/(?<= )[A-Z]/g, (c) => c.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase());

// The selected instance's properties, Figma-style: a select per enum, a
// toggle per boolean, each with its value as rendered and where it comes
// from. A change holds for this instance inside this story only.
const InstanceProps = ({
  name,
  storyName,
  self,
  report,
  specs,
  edits,
  onSet,
  onReset,
}: Props) => {
  if (self) {
    return (
      <p className="wb-instance-scope" data-testid="wb-instance-scope">
        Changes every {name}: set them in Props below.
      </p>
    );
  }
  const scope = (
    <p className="wb-instance-scope" data-testid="wb-instance-scope">
      Changes this {name} inside {storyName}
    </p>
  );
  if (!report || !specs) {
    return (
      <>
        {scope}
        <p className="wb-instance-props-note" aria-busy="true">
          Reading its props…
        </p>
      </>
    );
  }
  if (specs.length === 0) {
    return (
      <>
        {scope}
        <p className="wb-instance-props-note">
          {name} has no switchable props in its stories.
        </p>
      </>
    );
  }
  return (
    <>
      {scope}
      <ul
        className="wb-instance-props"
        data-testid="wb-instance-props"
        aria-label={`${name} props`}
      >
        {specs.map((spec) => {
          const value = report.props[spec.name];
          const edit = edits.find((e) => e.prop === spec.name);
          const mark: Mark = edit
            ? 'changed'
            : report.set.includes(spec.name)
            ? 'code'
            : 'default';
          const id = `wb-instance-prop-${spec.name}`;
          return (
            <li
              key={spec.name}
              className={`wb-instance-prop wb-instance-prop-${mark}`}
              data-testid="wb-instance-prop"
              data-prop={spec.name}
              data-mark={mark}
            >
              <label htmlFor={id} title={spec.name}>
                {labelOf(spec.name)}
              </label>
              {spec.kind === 'boolean' ? (
                <span className="wb-instance-prop-field">
                  <input
                    id={id}
                    type="checkbox"
                    role="switch"
                    className="wb-switch"
                    checked={value === true}
                    onChange={(e) => onSet(spec.name, e.currentTarget.checked)}
                  />
                </span>
              ) : (
                <span className="wb-instance-prop-field">
                  <select
                    id={id}
                    value={valueText(value)}
                    onChange={(e) => {
                      const picked = spec.options.find(
                        (o) => String(o) === e.currentTarget.value
                      );
                      if (picked !== undefined) onSet(spec.name, picked);
                    }}
                  >
                    {value === null && <option value="not set">not set</option>}
                    {spec.options.map((o) => (
                      <option key={String(o)} value={String(o)}>
                        {String(o)}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron" size={12} />
                </span>
              )}
              <span
                className="wb-instance-mark"
                title={MARK_TEXT[mark]}
                aria-label={MARK_TEXT[mark]}
              >
                {MARK_SHORT[mark]}
              </span>
              {edit ? (
                <button
                  type="button"
                  className="wb-instance-reset"
                  data-testid="wb-instance-reset"
                  aria-label={`Reset ${spec.name}`}
                  title={`Back to ${valueText(edit.from)}`}
                  onClick={() => onReset(edit)}
                >
                  <Icon name="reset" size={12} />
                </button>
              ) : (
                <span className="wb-instance-reset" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default InstanceProps;
