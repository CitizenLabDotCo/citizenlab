import { useState, useCallback } from 'react';

// hooks
import useIdeas from 'api/ideas/useIdeas';

// utils
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';

// typings
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import {
  IQueryParameters,
  Sort,
  SortAttribute,
  IIdeaData,
  IdeaPublicationStatus,
} from 'api/ideas/types';

interface Props extends Omit<IQueryParameters, 'sort' | 'basket_id'> {
  sort?: Sort;
  children?: children;
}

type children = (renderProps: GetIdeasChildProps) => JSX.Element | null;

interface State {
  queryParameters: IQueryParameters;
  list: IIdeaData[] | undefined;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
}

export type GetIdeasChildProps = State & {
  onLoadMore: () => void;
  onChangePage: (pageNumber: number) => void;
  onChangeProjects: (projectIds: string[]) => void;
  onChangePhase: (phaseId: string) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeSorting: (sort: Sort) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeStatus: (ideaStatus?: string) => void;
  onChangePublicationStatus: (publicationStatus: IdeaPublicationStatus) => void;
  onChangeProjectPublicationStatus: (
    ProjectPublicationStatus: ProjectPublicationStatus
  ) => void;
  onChangeAssignee: (assignee?: string) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
  onIdeaFiltering: (partialQueryParameters: Partial<IQueryParameters>) => void;
  onResetParams: (paramsToOmit?: (keyof IQueryParameters)[]) => void;
};

const noChanges = (
  newQueryParameters: Partial<IQueryParameters>,
  combinedQueryParameters: IQueryParameters
) => {
  for (const key in newQueryParameters) {
    if (newQueryParameters[key] !== combinedQueryParameters) return false;
  }

  return true;
};

const GetIdeas = ({ children, sort = 'random', ...otherProps }: Props) => {
  const [queryParameters, setQueryParameters] = useState({
    sort,
    ...otherProps,
    'page[number]': 1,
    'page[size]': otherProps['page[size]'] ?? 24,
  });
  const { data, isFetching, isRefetching } = useIdeas(queryParameters);

  const list = data?.data;

  const currentPage =
    (data?.links.self ? getPageNumberFromUrl(data?.links?.self) : null) ?? 1;

  const lastPage =
    (data?.links.last ? getPageNumberFromUrl(data?.links?.last) : null) ?? 1;

  const sortAttribute = getSortAttribute<Sort, SortAttribute>(
    queryParameters.sort
  );
  const sortDirection = getSortDirection<Sort>(queryParameters.sort);

  const updateQuery = useCallback(
    (newQueryParameters: Partial<IQueryParameters>) => {
      if (noChanges(newQueryParameters, queryParameters)) return;

      setQueryParameters((currentQueryParameters) => ({
        ...currentQueryParameters,
        ...newQueryParameters,
      }));
    },
    [queryParameters]
  );

  const loadMore = useCallback(() => {
    if (isFetching || isRefetching) return;
    updateQuery({ 'page[number]': currentPage + 1 });
  }, [isFetching, isRefetching, updateQuery, currentPage]);

  const handleChangePage = useCallback(
    (pageNumber: number) => {
      updateQuery({ 'page[number]': pageNumber });
    },
    [updateQuery]
  );

  const handlePhaseOnChange = useCallback(
    (phase: string) => {
      updateQuery({ phase, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleSearchOnChange = useCallback(
    (search: string) => {
      updateQuery({ search, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleSortOnChange = useCallback(
    (sort: Sort) => {
      updateQuery({ sort, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleProjectsOnChange = useCallback(
    (projects: string[]) => {
      updateQuery({ projects, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleTopicsOnChange = useCallback(
    (topics: string[]) => {
      updateQuery({ topics, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleStatusOnChange = useCallback(
    (idea_status: string | undefined) => {
      updateQuery({ idea_status, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handlePublicationStatusOnChange = useCallback(
    (publication_status: IdeaPublicationStatus) => {
      updateQuery({ publication_status, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleProjectPublicationStatusOnChange = useCallback(
    (project_publication_status: ProjectPublicationStatus) => {
      updateQuery({ project_publication_status, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleAssigneeOnChange = useCallback(
    (assignee: string | undefined) => {
      updateQuery({ assignee, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleFeedbackFilterOnChange = useCallback(
    (feedback_needed: boolean) => {
      updateQuery({ feedback_needed, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleIdeaFiltering = useCallback(
    (ideaFilters: Partial<IQueryParameters>) => {
      updateQuery({ ...ideaFilters, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleResetParamsToProps = useCallback(() => {
    setQueryParameters({
      sort,
      ...otherProps,
      'page[number]': 1,
      'page[size]': otherProps['page[size]'] ?? 24,
    });
  }, [sort, otherProps]);

  return (children as children)({
    queryParameters,
    list,
    hasMore: currentPage !== lastPage,
    querying: isFetching,
    loadingMore: isRefetching,
    sortAttribute,
    sortDirection,
    currentPage,
    lastPage,
    onLoadMore: loadMore,
    onChangePage: handleChangePage,
    onChangeProjects: handleProjectsOnChange,
    onChangePhase: handlePhaseOnChange,
    onChangeSearchTerm: handleSearchOnChange,
    onChangeSorting: handleSortOnChange,
    onChangeTopics: handleTopicsOnChange,
    onChangeStatus: handleStatusOnChange,
    onChangePublicationStatus: handlePublicationStatusOnChange,
    onChangeProjectPublicationStatus: handleProjectPublicationStatusOnChange,
    onChangeAssignee: handleAssigneeOnChange,
    onChangeFeedbackFilter: handleFeedbackFilterOnChange,
    onIdeaFiltering: handleIdeaFiltering,
    onResetParams: handleResetParamsToProps,
  });
};

export default GetIdeas;
