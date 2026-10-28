import { KeyboardEvent, ReactNode, useRef } from 'react';

import Icon, { IconName } from './Icon';
import Panel from './Panel';

export type PanelTab<T extends string> = {
  id: T;
  label: string;
  icon: IconName;
  // A number on the tab (props, tokens, uses); hidden while unknown.
  count?: number;
  content: ReactNode;
};

type Props<T extends string> = {
  title: string;
  tabs: PanelTab<T>[];
  value: T;
  onChange: (id: T) => void;
};

// The panel column as tabs. Every tab stays mounted (hidden when not
// chosen), so a panel keeps its state and its reads of the canvas.
// Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern).
const PanelTabs = <T extends string>({
  title,
  tabs,
  value,
  onChange,
}: Props<T>) => {
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const at = tabs.findIndex((t) => t.id === value);
    const next =
      e.key === 'ArrowRight'
        ? (at + 1) % tabs.length
        : e.key === 'ArrowLeft'
        ? (at - 1 + tabs.length) % tabs.length
        : e.key === 'Home'
        ? 0
        : e.key === 'End'
        ? tabs.length - 1
        : -1;
    if (next === -1) return;
    e.preventDefault();
    onChange(tabs[next].id);
    list.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };
  return (
    <Panel
      title={title}
      header={
        <div
          className="wb-panel-tabs"
          role="tablist"
          aria-label={title}
          ref={list}
          onKeyDown={onKey}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`wb-panel-tab-${t.id}`}
              aria-controls={`wb-panel-${t.id}`}
              aria-selected={t.id === value}
              tabIndex={t.id === value ? 0 : -1}
              data-testid="wb-panel-tab"
              data-tab={t.id}
              onClick={() => onChange(t.id)}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.count !== undefined && (
                <span className="wb-panel-tab-count">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      }
    >
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`wb-panel-${t.id}`}
          aria-labelledby={`wb-panel-tab-${t.id}`}
          className="wb-panel-body"
          hidden={t.id !== value}
        >
          {t.content}
        </div>
      ))}
    </Panel>
  );
};

export default PanelTabs;
