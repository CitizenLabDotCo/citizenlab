import { createContext, ReactNode, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';

// The right-hand panel column. A page opts in by rendering <Panel>; the
// column is shown only while at least one panel is mounted.
type PanelSlot = {
  element: HTMLElement | null;
  register: () => () => void;
};

export const PanelContext = createContext<PanelSlot>({
  element: null,
  register: () => () => undefined,
});

// `header` takes the place of the title heading (the panel tabs).
type Props = { title: string; header?: ReactNode; children: ReactNode };

const Panel = ({ title, header, children }: Props) => {
  const { element, register } = useContext(PanelContext);
  useEffect(register, [register]);
  if (!element) return null;
  return createPortal(
    <section className="wb-panel" aria-label={title}>
      {header ?? <h2>{title}</h2>}
      {children}
    </section>,
    element
  );
};

export default Panel;
