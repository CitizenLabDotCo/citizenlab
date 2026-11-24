import { createContext } from 'react';

export type SelectionLabels = {
  selectAll: string;
  selectRow: string;
};

// Set when the table has selection on, so the header and rows add their checkboxes.
const SelectionLabelsContext = createContext<SelectionLabels | null>(null);

export default SelectionLabelsContext;
