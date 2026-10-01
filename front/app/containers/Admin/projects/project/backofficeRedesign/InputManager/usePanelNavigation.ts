import { IIdeaData, IIdeaQueryParameters } from 'api/ideas/types';
import useIdeas from 'api/ideas/useIdeas';

import { PanelNavigation } from './SidePanel/PanelHeader';

interface Props {
  openIdeaId: string | undefined;
  pageIdeas: IIdeaData[];
  listParameters: IIdeaQueryParameters<string | string[]>;
  page: number;
  pageSize: number;
  lastPage: number;
  total: number | undefined;
  onOpen: (ideaId: string) => void;
  onChangePage: (page: number) => void;
}

// Previous and next work across pages, but the neighbouring page is only
// loaded once the open input is the first or last one of its page.
const usePanelNavigation = ({
  openIdeaId,
  pageIdeas,
  listParameters,
  page,
  pageSize,
  lastPage,
  total,
  onOpen,
  onChangePage,
}: Props): PanelNavigation | undefined => {
  const index = pageIdeas.findIndex((idea) => idea.id === openIdeaId);
  const needsPreviousPage = index === 0 && page > 1;
  const needsNextPage =
    index >= 0 && index === pageIdeas.length - 1 && page < lastPage;

  const previousPage = useIdeas(
    { ...listParameters, 'page[number]': page - 1 },
    { enabled: needsPreviousPage }
  );
  const nextPage = useIdeas(
    { ...listParameters, 'page[number]': page + 1 },
    { enabled: needsNextPage }
  );

  if (index < 0 || total === undefined) return undefined;

  // Placeholder data belongs to another page, so it can't be navigated to.
  const lastOfPreviousPage =
    needsPreviousPage && !previousPage.isPlaceholderData
      ? previousPage.data?.data.at(-1)
      : undefined;
  const firstOfNextPage =
    needsNextPage && !nextPage.isPlaceholderData
      ? nextPage.data?.data[0]
      : undefined;

  const isFirstOnPage = index === 0;
  const isLastOnPage = index === pageIdeas.length - 1;
  const previous = isFirstOnPage ? lastOfPreviousPage : pageIdeas[index - 1];
  const next = isLastOnPage ? firstOfNextPage : pageIdeas[index + 1];

  return {
    position: (page - 1) * pageSize + index + 1,
    total,
    onPrevious: previous
      ? () => {
          if (isFirstOnPage) onChangePage(page - 1);
          onOpen(previous.id);
        }
      : undefined,
    onNext: next
      ? () => {
          if (isLastOnPage) onChangePage(page + 1);
          onOpen(next.id);
        }
      : undefined,
  };
};

export default usePanelNavigation;
