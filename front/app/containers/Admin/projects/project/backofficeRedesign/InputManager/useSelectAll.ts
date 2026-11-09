import { useRef, useState } from 'react';

import fetchAllIdeas from 'api/ideas/fetchAllIdeas';
import { IIdeaData, IIdeaQueryParameters } from 'api/ideas/types';

const useSelectAll = (
  queryParameters: IIdeaQueryParameters<string | string[]>,
  onSelect: (ideas: IIdeaData[]) => void
) => {
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  // The disabled state only arrives after a render, so two quick clicks
  // would both get through without this.
  const inFlight = useRef(false);

  const selectAll = async () => {
    if (inFlight.current) return;

    inFlight.current = true;
    setIsSelectingAll(true);
    try {
      onSelect(await fetchAllIdeas(queryParameters));
    } finally {
      inFlight.current = false;
      setIsSelectingAll(false);
    }
  };

  return { selectAll, isSelectingAll };
};

export default useSelectAll;
