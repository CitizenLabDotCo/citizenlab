import React, { ReactNode } from 'react';

export type GvMode = 'today' | 'redesign';

interface Props {
  mode?: GvMode;
  children: ReactNode;
}

/**
 * Scopes a subtree to a design-token mode (see tokens/tokens.css). Pages
 * outside a ModeScope keep today's values from :root. `display: contents`
 * means the wrapper takes no part in layout.
 */
const ModeScope = ({ mode = 'redesign', children }: Props) => (
  <div data-gv-mode={mode} style={{ display: 'contents' }}>
    {children}
  </div>
);

export default ModeScope;
