import { ReactNode, useState } from 'react';

import Icon from './Icon';

const KEY = 'wb-insp-open';

const readOpen = (id: string, fallback: boolean) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return typeof all[id] === 'boolean' ? all[id] : fallback;
  } catch {
    return fallback;
  }
};

const writeOpen = (id: string, open: boolean) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    window.localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: open }));
  } catch {
    // Not kept.
  }
};

// A block of the inspector that folds, and remembers it.
const InspSection = ({
  id,
  title,
  count,
  defaultOpen = true,
  actions,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(() => readOpen(id, defaultOpen));
  const toggle = () => {
    setOpen(!open);
    writeOpen(id, !open);
  };
  return (
    <section
      className="wb-insp-block"
      data-testid="wb-insp-section"
      data-section={id}
      data-open={open}
    >
      <header className="wb-insp-head">
        <button
          type="button"
          className="wb-insp-fold"
          aria-expanded={open}
          aria-controls={`wb-insp-${id}`}
          onClick={toggle}
        >
          <Icon name="chevron" size={14} />
          <h3>{title}</h3>
          {count !== undefined && <span className="wb-count">{count}</span>}
        </button>
        {actions}
      </header>
      <div id={`wb-insp-${id}`} className="wb-insp-grid" hidden={!open}>
        {children}
      </div>
    </section>
  );
};

export default InspSection;
