import { useEffect, useMemo, useRef, useState } from 'react';

import Icon from '../components/Icon';
import {
  channelOf,
  Control,
  controlsOf,
  PreparedStory,
  readStory,
  resetArgs,
  updateArgs,
  whenRendered,
} from '../lib/preview';

type Props = {
  storyId: string;
  // The canvas frames (two side by side); the first one is read, every
  // one is written. null while a frame loads.
  frames: (Window | null)[];
};

// Text and number edits reach the story after a short pause in typing.
const TYPING_MS = 300;

// More unset props than this wait behind "Show N more props".
const FOLD_AFTER = 6;

const asText = (v: unknown) =>
  v === undefined || v === null ? '' : typeof v === 'string' ? v : String(v);

const Field = ({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: unknown;
  onChange: (v: unknown) => void;
}) => {
  const id = `wb-control-${control.name}`;
  const [draft, setDraft] = useState(asText(value));
  const timer = useRef<number>();
  useEffect(() => setDraft(asText(value)), [value]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const later = (v: unknown) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), TYPING_MS);
  };

  let input;
  switch (control.kind) {
    case 'boolean':
      input = (
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="wb-switch"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      break;
    case 'select': {
      // Options by position, so a number or boolean goes back as one.
      const at = control.options.findIndex((o) => o.value === value);
      input = (
        <select
          id={id}
          value={at === -1 ? '' : String(at)}
          onChange={(e) =>
            onChange(
              e.target.value === ''
                ? undefined
                : control.options[Number(e.target.value)].value
            )
          }
        >
          <option value="">Not set</option>
          {control.options.map((o, i) => (
            <option key={i} value={String(i)}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    }
    case 'number':
      input = (
        <input
          id={id}
          type="number"
          value={draft}
          placeholder="Not set"
          onChange={(e) => {
            setDraft(e.target.value);
            later(e.target.value === '' ? undefined : Number(e.target.value));
          }}
        />
      );
      break;
    case 'string':
      input = (
        <span className="wb-control-text">
          {control.colour && (
            <span
              className="wb-control-swatch"
              style={{ background: draft || 'transparent' }}
              aria-hidden="true"
            />
          )}
          <input
            id={id}
            type="text"
            value={draft}
            placeholder="Not set"
            spellCheck={false}
            onChange={(e) => {
              setDraft(e.target.value);
              later(e.target.value === '' ? undefined : e.target.value);
            }}
          />
        </span>
      );
      break;
  }

  return (
    <div
      className={
        control.kind === 'boolean'
          ? 'wb-control wb-control-inline'
          : 'wb-control'
      }
      data-testid="wb-control"
      data-arg={control.name}
      data-kind={control.kind}
    >
      <label htmlFor={id} title={control.description}>
        <code>{control.name}</code>
      </label>
      {input}
    </div>
  );
};

// The story's args as inputs (boolean, text, number and option lists).
// Read from the first frame's prepared story; an edit goes to every frame
// as `updateStoryArgs` (see lib/preview.ts for the preview API it uses).
const Controls = ({ storyId, frames }: Props) => {
  const [story, setStory] = useState<PreparedStory | null>(null);
  const [query, setQuery] = useState('');
  // Props the story leaves unset wait behind "More props" (Button has ~100).
  const [more, setMore] = useState(false);
  const first = frames[0] ?? null;
  // Every edit since the story loaded. A frame that is still loading (the
  // second frame of the split view, or one reloaded for a new language)
  // gets them all once its story has rendered, so both frames agree.
  const edits = useRef<Record<string, unknown>>({});
  const live = useRef(new WeakSet<Window>());
  const seen = useRef(new WeakSet<Window>());
  useEffect(() => {
    edits.current = {};
  }, [storyId]);
  const waits = useRef<(() => void)[]>([]);
  useEffect(() => () => waits.current.forEach((c) => c()), []);
  useEffect(() => {
    frames.forEach((w) => {
      if (!w || seen.current.has(w)) return;
      seen.current.add(w);
      waits.current.push(
        whenRendered(w, () => {
          live.current.add(w);
          if (Object.keys(edits.current).length > 0) {
            updateArgs(w, storyId, { ...edits.current });
          }
        })
      );
    });
  }, [frames, storyId]);

  useEffect(() => {
    setStory(null);
    if (!first) return undefined;
    const read = () => {
      const s = readStory(first);
      if (s) setStory(s);
    };
    read();
    const channel = channelOf(first);
    const events = ['storyPrepared', 'storyRendered', 'storyArgsUpdated'];
    events.forEach((e) => channel?.on(e, read));
    return () => events.forEach((e) => channel?.off(e, read));
  }, [first]);

  const { controls, skipped, setCount } = useMemo(
    () => {
      if (!story) return { controls: [], skipped: 0, setCount: 0 };
      const c = controlsOf(story);
      return {
        ...c,
        setCount: c.controls.filter((x) => story.args[x.name] !== undefined)
          .length,
      };
    },
    // Order by what the story set when it loaded, not after each edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story?.id, story?.argTypes]
  );
  const q = query.trim().toLowerCase();
  // Fold only a long tail: a few unset props show as they are.
  const folded = !q && !more && controls.length - setCount > FOLD_AFTER;
  const shown = q
    ? controls.filter((c) => c.name.toLowerCase().includes(q))
    : folded
    ? controls.slice(0, setCount)
    : controls;
  const hidden = controls.length - setCount;
  const ready = story && story.id === storyId;

  const set = (name: string, value: unknown) => {
    setStory((s) => (s ? { ...s, args: { ...s.args, [name]: value } } : s));
    edits.current = { ...edits.current, [name]: value };
    frames.forEach((w) => {
      if (w && live.current.has(w)) updateArgs(w, storyId, { [name]: value });
    });
  };
  const reset = () => {
    edits.current = {};
    frames.forEach((w) => {
      if (w && live.current.has(w)) resetArgs(w, storyId);
    });
  };

  return (
    <div className="wb-controls" data-testid="wb-controls">
      {!ready ? (
        <div className="wb-controls-loading" aria-label="Loading the story">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="wb-skeleton-line" />
          ))}
        </div>
      ) : controls.length === 0 ? (
        <div className="wb-controls-empty">
          <Icon name="sliders" size={20} />
          <p>This story has no props to set here.</p>
        </div>
      ) : (
        <>
          <div className="wb-controls-head">
            {controls.length > 8 && (
              <label className="wb-search wb-controls-search">
                <span className="wb-visually-hidden">Find a prop</span>
                <Icon name="search" size={14} />
                <input
                  type="search"
                  placeholder="Find a prop"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            <button
              type="button"
              className="wb-icon-button"
              onClick={reset}
              title="Back to the story's args"
              data-testid="wb-controls-reset"
            >
              <Icon name="reset" size={16} />
              Reset
            </button>
          </div>
          {frames.length > 1 && (
            <p className="wb-controls-note">Edits apply to both frames.</p>
          )}
          <div className="wb-control-list">
            {shown.map((c) => (
              <Field
                key={`${story.id}:${c.name}`}
                control={c}
                value={story.args[c.name]}
                onChange={(v) => set(c.name, v)}
              />
            ))}
            {q && shown.length === 0 && (
              <p className="wb-muted wb-controls-none">No prop matches.</p>
            )}
          </div>
          {folded && setCount === 0 && (
            <p className="wb-controls-unset" data-testid="wb-controls-unset">
              This story sets no props: it shows the component as it comes.
            </p>
          )}
          {!q && hidden > FOLD_AFTER && (
            <button
              type="button"
              className="wb-controls-more"
              aria-expanded={!folded}
              onClick={() => setMore(!more)}
              data-testid="wb-controls-more"
            >
              {folded
                ? `Show ${hidden} ${setCount > 0 ? 'more ' : ''}${
                    hidden === 1 ? 'prop' : 'props'
                  }`
                : setCount > 0
                ? 'Show only the props this story sets'
                : 'Hide the props'}
            </button>
          )}
          {skipped > 0 && (
            <p className="wb-controls-note">
              {`${skipped} ${
                skipped === 1 ? 'prop takes' : 'props take'
              } code (React nodes, objects or functions) and ${
                skipped === 1 ? 'is' : 'are'
              } left out.`}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Controls;
