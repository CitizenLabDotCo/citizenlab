import { useRef, useState } from 'react';

import fetchAllIdeas from 'api/ideas/fetchAllIdeas';
import { IIdeaData, IIdeaQueryParameters } from 'api/ideas/types';

const useSelection = (
  pageIdeas: IIdeaData[],
  queryParameters: IIdeaQueryParameters<string | string[]>
) => {
  const [selection, setSelection] = useState<Map<string, IIdeaData>>(new Map());
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [selectAllFailed, setSelectAllFailed] = useState(false);
  // The sort doesn't change which inputs are listed.
  const { sort: _sort, ...listed } = queryParameters;
  const listKey = JSON.stringify(listed);
  const [selectionListKey, setSelectionListKey] = useState(listKey);
  // Select all fetches every page, so the list or the selection can change
  // before it is done. Its result only applies if neither did.
  const selectAllRequest = useRef(0);
  const currentListKey = useRef(listKey);
  currentListKey.current = listKey;

  // A selection belongs to the list it was made in. Kept across a filter
  // change, batch actions would reach inputs that are no longer listed.
  if (selectionListKey !== listKey) {
    setSelectionListKey(listKey);
    setSelection(new Map());
    setIsSelectingAll(false);
    setSelectAllFailed(false);
  }

  const change = (next: Map<string, IIdeaData>) => {
    selectAllRequest.current += 1;
    setIsSelectingAll(false);
    setSelectAllFailed(false);
    setSelection(next);
  };

  const toggle = (idea: IIdeaData) => {
    const next = new Map(selection);
    if (!next.delete(idea.id)) next.set(idea.id, idea);
    change(next);
  };

  const togglePage = () => {
    const next = new Map(selection);
    const allSelected = pageIdeas.every((idea) => next.has(idea.id));
    pageIdeas.forEach((idea) =>
      allSelected ? next.delete(idea.id) : next.set(idea.id, idea)
    );
    change(next);
  };

  const clear = () => change(new Map());

  const selectAll = async () => {
    const request = ++selectAllRequest.current;
    const requestListKey = listKey;
    const isLatest = () => request === selectAllRequest.current;
    const isCurrent = () =>
      isLatest() && requestListKey === currentListKey.current;

    setIsSelectingAll(true);
    setSelectAllFailed(false);
    try {
      const ideas = await fetchAllIdeas(queryParameters);
      if (isCurrent()) {
        setSelection(new Map(ideas.map((idea) => [idea.id, idea])));
      }
    } catch {
      if (isCurrent()) setSelectAllFailed(true);
    } finally {
      if (isLatest()) setIsSelectingAll(false);
    }
  };

  const refresh = (updated: IIdeaData[]) =>
    setSelection((current) => {
      const next = new Map(current);
      updated.forEach((idea) => {
        if (next.has(idea.id)) next.set(idea.id, idea);
      });
      return next;
    });

  // The listed version first: a selected one can predate an edit.
  const pageIdeasById = new Map(pageIdeas.map((idea) => [idea.id, idea]));
  const selectedIdeas = [...selection.values()].map(
    (idea) => pageIdeasById.get(idea.id) ?? idea
  );

  return {
    selectedIds: [...selection.keys()],
    selectedIdeas,
    toggle,
    togglePage,
    clear,
    refresh,
    selectAll,
    isSelectingAll,
    selectAllFailed,
  };
};

export default useSelection;
