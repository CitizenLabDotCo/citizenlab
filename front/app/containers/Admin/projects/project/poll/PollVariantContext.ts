import { createContext, useContext } from 'react';

export type PollVariant = 'default' | 'panel';

export const PollVariantContext = createContext<PollVariant>('default');

// The poll editor also lives in the redesigned back office, where it renders
// design-system components.
export const useIsPanelPoll = () => useContext(PollVariantContext) === 'panel';
