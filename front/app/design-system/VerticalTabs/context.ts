import { createContext } from 'react';

// Settings: the settings modals. Rail: the category rail of the method picker.
export type VerticalTabsStyle = 'settings' | 'rail';

export const StyleContext = createContext<VerticalTabsStyle>('settings');
