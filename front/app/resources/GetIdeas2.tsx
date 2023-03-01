import { useState, useCallback, useEffect, useMemo } from 'react';

// services
import {
  ideasStream,
  Sort,
  SortAttribute,
  IIdeasQueryParameters,
  IIdeaData,
  IdeaPublicationStatus,
  IIdeas,
} from 'services/ideas';

// utils
import {
  getPageNumberFromUrl,
  getSortAttribute,
  getSortDirection,
  SortDirection,
} from 'utils/paginationUtils';
import { omitBy } from 'lodash-es';
import { isNil, isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
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

const noChanges = (
  newQueryParameters: Partial<IIdeasQueryParameters>,
  combinedQueryParameters: IIdeasQueryParameters
) => {
  for (const key in newQueryParameters) {
    if (newQueryParameters[key] !== combinedQueryParameters) return false;
  }

  return true;
};

const GetIdeas = ({
  children,
  type,
  sort = 'random',
  ...otherProps
}: Props) => {
  const otherPropsStr = JSON.stringify(otherProps);

  const queryParametersFromProps = useMemo(
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
    queryParametersFromProps
  );

  const combinedQueryParameters = useMemo(
    (): IIdeasQueryParameters => ({
      ...queryParameters,

      // Omit all queryParameters that are nil.
      // Why do this? Because we assume that an input prop that's nil is an input prop that should be ignored,
      // and not overwrite a none-nil value that's part of the queryParameters state.
      ...omitBy(queryParametersFromProps, isNil),

      // Make an exception for 'projects', because when it's undefined we don't want to ignore it but instead pass it along
      // to let the request know we don't want to apply a projects filter but load the ideas for all projects
      // Note Luuc: I just copied these comments over during a refactor, we should really improve this weirdness
      projects: queryParametersFromProps.projects,
    }),
    [queryParameters, queryParametersFromProps]
  );

  const [list, setList] = useState<IIdeaData[] | NilOrError>();
  const [hasMore /* , setHasMore */] = useState(false);
  const [querying, setQuerying] = useState(true);
  const [loadingMore /* , setLoadingMore */] = useState(false);
  const [lastPage, setLastPage] = useState(1);

  const sortAttribute = getSortAttribute<Sort, SortAttribute>(
    queryParameters.sort
  );
  const sortDirection = getSortDirection<Sort>(queryParameters.sort);
  const currentPage = queryParameters['page[number]'];

  // Load data
  useEffect(() => {
    setQuerying(true);

    if (type === 'paginated') {
      const { observable } = ideasStream({
        queryParameters: combinedQueryParameters,
      });

      const subscription = observable.subscribe(
        (response: IIdeas | NilOrError) => {
          if (isNilOrError(response)) {
            setList(response);
          } else {
            setList(response.data);
            setLastPage(getPageNumberFromUrl(response.links.last) || 1);
          }

          setQuerying(false);
        }
      );

      return () => subscription.unsubscribe();
    }

    return;
  }, [type, combinedQueryParameters]);

  const updateQuery = useCallback(
    (newQueryParameters: Partial<IIdeasQueryParameters>) => {
      if (noChanges(newQueryParameters, combinedQueryParameters)) return;

      setQueryParameters((currentQueryParameters) => ({
        ...currentQueryParameters,
        ...newQueryParameters,
      }));
    },
    [combinedQueryParameters]
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
    setQueryParameters(queryParametersFromProps);
  }, [queryParametersFromProps]);

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
