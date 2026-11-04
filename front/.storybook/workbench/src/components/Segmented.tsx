import type { ReactNode } from 'react';

type Option<T extends string> = {
  value: T;
  label: ReactNode;
  count?: number;
  title?: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  testId?: string;
};

// A row of toggle buttons, one pressed (the shell's .wb-segmented).
const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: Props<T>) => (
  <div
    className="wb-segmented"
    role="group"
    aria-label={label}
    data-testid={testId}
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={o.value === value}
        title={o.title}
        data-value={o.value}
        onClick={() => onChange(o.value)}
      >
        {o.label}
        {o.count !== undefined && (
          <span className="wb-segmented-count">{o.count}</span>
        )}
      </button>
    ))}
  </div>
);

export default Segmented;
