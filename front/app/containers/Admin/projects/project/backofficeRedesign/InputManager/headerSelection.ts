import { Selection } from 'design-system/types';

interface Params {
  pageIds: string[];
  selectedIds: Set<string>;
  onSelectOnPage: (ideaIds: Set<string>) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

// The header checkbox acts on every input that matches the filters, not only
// this page, so the selection bar needs no separate "Select all".
const headerSelectionHandler =
  ({
    pageIds,
    selectedIds,
    onSelectOnPage,
    onSelectAll,
    onClearSelection,
  }: Params) =>
  (keys: Selection) => {
    if (keys === 'all') {
      onSelectOnPage(new Set(pageIds));
      onSelectAll();
      return;
    }

    const ids = [...keys].map(String);
    const pageWasFull =
      pageIds.length > 1 && pageIds.every((id) => selectedIds.has(id));

    // Unticking a single row never empties a full page, only the header does.
    if (ids.length === 0 && pageWasFull) {
      onClearSelection();
      return;
    }

    onSelectOnPage(new Set(ids));
  };

export default headerSelectionHandler;
