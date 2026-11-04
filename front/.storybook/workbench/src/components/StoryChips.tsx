import type { StoryRef } from '../lib/stories';

type Props = {
  id: string;
  label: string;
  stories: StoryRef[];
  value: string;
  tabLabel: (s: StoryRef) => string;
  onChange: (id: string) => void;
};

// Every state or variant of a component as a chip: one click switches. The
// group's name leads the row, in the muted colour.
const StoryChips = ({
  id,
  label,
  stories,
  value,
  tabLabel,
  onChange,
}: Props) => (
  <div
    className="wb-story-chips"
    role="group"
    aria-label={label}
    data-testid={`wb-insp-${id}`}
  >
    <span className="wb-story-chips-label" aria-hidden="true">
      {label}
    </span>
    <span className="wb-story-chips-list">
      {stories.map((s) => (
        <button
          key={s.id}
          type="button"
          className="wb-story-chip"
          aria-pressed={s.id === value}
          data-value={s.id}
          onClick={() => s.id !== value && onChange(s.id)}
        >
          {tabLabel(s)}
        </button>
      ))}
    </span>
  </div>
);

export default StoryChips;
