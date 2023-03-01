import { useState, useCallback, useEffect } from 'react';

// utils
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';
import { omitBy } from 'lodash-es';
import { isNil, NilOrError } from 'utils/helperUtils';

// typings
import {
  Sort,
  SortAttribute,
  IIdeasQueryParameters,
  IIdeaData,
  IdeaPublicationStatus,
} from 'services/ideas';
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';

interface QueryParameterProps {
  projects?: string[];
  phase?: string;
  author?: string;
  sort?: Sort;
  idea_status?: string;
  project_publication_status?: ProjectPublicationStatus;
  assignee?: string;
  feedback_needed?: boolean;
  filter_can_moderate: boolean;
}

interface Props extends QueryParameterProps {
  type: 'load-more' | 'paginated';
  children: children;
}

type children = (renderProps: GetIdeasChildProps) => JSX.Element | null;

interface State {
  queryParameters: IIdeasQueryParameters;
  list: IIdeaData[] | NilOrError;
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
  onIdeaFiltering: (
    partialQueryParameters: Partial<IIdeasQueryParameters>
  ) => void;
  onResetParams: (paramsToOmit?: (keyof IIdeasQueryParameters)[]) => void;
};

const GetIdeas = ({
  children,
  type,
  sort = 'random',
  ...otherProps
}: Props) => {
  const otherPropsStr = JSON.stringify(otherProps);

  const getQueryParametersFromProps = useCallback(
    () =>
      ({
        ...JSON.parse(otherPropsStr),
        sort,
        'page[number]': 1,
        'page[size]': 12,
        search: undefined,
      } as IIdeasQueryParameters),
    [otherPropsStr, sort]
  );

  const [queryParameters, setQueryParameters] = useState<IIdeasQueryParameters>(
    getQueryParametersFromProps()
  );

  const [list, setList] = useState<IIdeaData[] | NilOrError>();
  const [hasMore, setHasMore] = useState(false);
  const [querying, setQuerying] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPage, setLastPage] = useState(1);

  const sortAttribute = getSortAttribute<Sort, SortAttribute>(
    queryParameters.sort
  );
  const sortDirection = getSortDirection<Sort>(queryParameters.sort);
  const currentPage = queryParameters['page[number]'];

  // Keep queryParameters in sync with props
  useEffect(() => {
    setQueryParameters((queryParameters) => {
      const queryParametersFromProps = getQueryParametersFromProps();

      return {
        ...queryParameters,

        // Omit all queryParameters that are nil.
        // Why do this? Because we assume that an input prop that's nil is an input prop that should be ignored,
        // and not overwrite a none-nil value that's part of the queryParameters state.
        ...omitBy(queryParametersFromProps, isNil),

        // Make an exception for 'projects', because when it's undefined we don't want to ignore it but instead pass it along
        // to let the request know we don't want to apply a projects filter but load the ideas for all projects
        // Note Luuc: I just copied these comments over during a refactor, we should really improve this
        projects: queryParametersFromProps.projects,
      };
    });
  }, [getQueryParametersFromProps]);

  // Load data
  useEffect(() => {}, [type, queryParameters]);

  const updateQuery = useCallback(
    (newQueryParameters: Partial<IIdeasQueryParameters>) => {
      setQueryParameters((currentQueryParameters) => ({
        ...currentQueryParameters,
        ...newQueryParameters,
      }));
    },
    []
  );

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    updateQuery({ 'page[number]': currentPage + 1 });
  }, [loadingMore, updateQuery, currentPage]);

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
    (ideaFilters: Partial<IIdeasQueryParameters>) => {
      updateQuery({ ...ideaFilters, 'page[number]': 1 });
    },
    [updateQuery]
  );

  const handleResetParamsToProps = useCallback(() => {
    setQueryParameters(getQueryParametersFromProps());
  }, [getQueryParametersFromProps]);

  return (children as children)({
    queryParameters,
    list,
    hasMore,
    querying,
    loadingMore,
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
