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

type Props = { title: string; children: ReactNode };

const Panel = ({ title, children }: Props) => {
  const { element, register } = useContext(PanelContext);
  useEffect(register, [register]);
  if (!element) return null;
  return createPortal(
    <section className="wb-panel" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>,
    element
  );
};

export default Panel;
