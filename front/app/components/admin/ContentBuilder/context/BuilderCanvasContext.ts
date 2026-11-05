import { createContext, useContext } from 'react';

// Builders render their nodes through RenderNode, which provides this context.
// Previews and published pages render through PlainDiv, so they keep the
// default and never show builder-only affordances to citizens.
export const BuilderCanvasContext = createContext(false);

export const useIsInBuilderCanvas = () => useContext(BuilderCanvasContext);
