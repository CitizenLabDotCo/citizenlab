import React from 'react';
import { get, isString, isEmpty, isEqual, isBoolean, omit, pick, omitBy } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, delay, tap } from 'rxjs/operators';
import { ideasStream, IIdeaData, IdeaPublicationStatus } from 'services/ideas';
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import { getPageNumberFromUrl, getSortAttribute, getSortDirection, SortDirection } from 'utils/paginationUtils';
import { isNilOrError } from 'utils/helperUtils';

export type SortAttribute = 'new' | 'trending' | 'popular' | 'author_name' | 'upvotes_count' | 'downvotes_count' | 'baskets_count' | 'status';
export type Sort = 'random' | 'new' | '-new' | 'trending' | '-trending' | 'popular' | '-popular' | 'author_name' | '-author_name' | 'upvotes_count' | '-upvotes_count' | 'downvotes_count' | '-downvotes_count' | 'baskets_count' | '-baskets_count' | 'status' | '-status';
export type PublicationStatus = IdeaPublicationStatus;

export interface InputProps {
  // pagination
  type: 'load-more' | 'paginated';
  pageNumber?: number; // defaults to 1
  pageSize?: number; // defaults to 12

  // overwritable params (can be changed freely with methods)
  sort?: Sort; // defaults to random

  // component instance filters (can be precised with methods, not overwritten)
  projectIds?: string[] | undefined | null;
  phaseId?: string | undefined | null;
  authorId?: string | undefined | null;
  topics?: string[] | undefined | null;
  areas?: string[] | undefined | null;
  ideaStatusId?: string | undefined | null;
  publicationStatus?: PublicationStatus | undefined | null;
  projectPublicationStatus?: ProjectPublicationStatus | undefined | null;
  assignee?: string | undefined | null;
  feedbackNeeded?: boolean | undefined | null;

  // can only change with prop change
  cache?: boolean;
  boundingBox?: number[];

  // search?: string; Now only possible with onChangeSearchTerm
}

// parameters as passed in to the streams
interface IQueryParameters {
  'page[number]': number;
  'page[size]': number;
  sort: Sort;
  search: string | undefined;
  areas: string[] | undefined;
  assignee: string | undefined;
  author: string | undefined;
  bounding_box: number[] | undefined;
  feedback_needed: boolean | undefined;
  idea_status: string | undefined;
  phase: string | undefined;
  project_publication_status: ProjectPublicationStatus | undefined;
  projects: string[] | undefined;
  publication_status: PublicationStatus | undefined;
  topics: string[] | undefined;
}

type children = (renderProps: GetIdeasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetIdeasChildProps = State & {
  onLoadMore: () => void;
  onChangePage: (pageNumber: number) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeSorting: (sort: Sort) => void;
  onChangeProjects: (projectIds: string[] | undefined) => void;
  onChangePhase: (phaseId: string) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeIdeaStatus: (ideaStatus: string) => void;
  onChangePublicationStatus: (publicationStatus: PublicationStatus) => void;
  onChangeProjectPublicationStatus: (ProjectPublicationStatus: ProjectPublicationStatus) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
  onResetParams: (paramsToOmit?: (keyof IQueryParameters)[]) => void;
};

interface State extends IQueryParameters {
  ideasList: IIdeaData[] | undefined | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
  sortAttribute: SortAttribute;
  sortDirection: SortDirection;
  currentPage: number;
  lastPage: number;
}

export default class GetIdeas extends React.Component<Props, State> {
  pageNumber$: BehaviorSubject<number>;
  search$: BehaviorSubject<string | undefined>;
  subscriptions: Subscription[];
  defaultQueryParameters: IQueryParameters;

  static defaultProps = {
    pageNumber: 1,
    pageSize: 12,
    sort: 'random'
  };

  constructor(props: Props) {
    super(props);
    const queryParameters = this.getQueryParametersFromProps();
    this.state = {
      // defaults
      ...queryParameters,
      ideasList: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false,
      sortAttribute: getSortAttribute<Sort, SortAttribute>(props.sort as Sort),
      sortDirection: getSortDirection<Sort>(props.sort as Sort),
      currentPage: 1,
      lastPage: 1
    };
    this.subscriptions = [];
    this.search$ = new BehaviorSubject(undefined);
    this.pageNumber$ = new BehaviorSubject(1);
  }

  componentDidMount() {
    this.subscriptions = [
      this.search$.pipe(
        tap((searchVal) => {
          const search = (isString(searchVal) && !isEmpty(searchVal)) ? searchVal : undefined;
          this.setState({ search, querying: true, loadingMore: false });
        }),
        debounceTime(500)
      ).subscribe(_searchVal => {
        this.pageNumber$.next(1);
      }),
      this.pageNumber$.pipe(
        // because methods change the state and push the new page value at the same time,
        // a small delay is needed so the state is updated when reading it.
        delay(200),
        switchMap(pageNumber => {
          const queryParameters = pick(this.state, [
            'projects',
            'page[size]',
            'phase',
            'author',
            'sort',
            'topics',
            'areas',
            'idea_status',
            'publication_status',
            'project_publication_status',
            'bounding_box',
            'assignee',
            'feedback_needed',
            'search'
          ]);
          queryParameters['page[number]'] = pageNumber;
          const cacheStream = (isBoolean(this.props.cache) ? this.props.cache : true);
          return ideasStream({ queryParameters, cacheStream }).observable;
        })
      ).subscribe((ideas) => {
        console.log(ideas);
        // if we received null or error, we just pass null in in any case
        if (isNilOrError(ideas)) {
          console.log('nil path!');
          this.setState({
            hasMore: false,
            ideasList: null,
            loadingMore: false,
            querying: false,
          });
        } else {
          console.log('notnil');
          console.log(this.state);

          const { loadingMore, ideasList, sort } = this.state;
          const selfLink = get(ideas, 'links.self');
          const lastLink = get(ideas, 'links.last');
          const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

          console.log('notnil2');
          const newstate = {
            hasMore,
            ideasList: (!loadingMore
              ? ideas.data
              : [...(!isNilOrError(ideasList) ? ideasList : []), ...ideas.data]),
            loadingMore: false,
            querying: false,
            sortAttribute: getSortAttribute<Sort, SortAttribute>(sort),
            sortDirection: getSortDirection<Sort>(sort),
            currentPage: getPageNumberFromUrl(ideas.links.self) || 1,
            lastPage: getPageNumberFromUrl(ideas.links.last) || 1
          };
          console.log(newstate);
          this.setState(newstate);
        }
        console.log('whyyyy !');
    })];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      this.setState({ ...this.getNonUndefinedQueryParametersFromProps(), loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  propsToQueryParamsShape = () => ({
    projects: this.props.projectIds ,
    'page[number]': this.props.pageNumber as number,
    'page[size]': this.props.pageSize as number,
    phase: this.props.phaseId,
    author: this.props.authorId,
    sort: this.props.sort as Sort,
    topics: this.props.topics,
    areas: this.props.areas,
    idea_status: this.props.ideaStatusId,
    publication_status: this.props.publicationStatus,
    project_publication_status: this.props.projectPublicationStatus,
    bounding_box: this.props.boundingBox,
    assignee: this.props.assignee,
    feedback_needed: this.props.feedbackNeeded,
    search: undefined
  })

  getNonUndefinedQueryParametersFromProps = () => {
    // omits undefined params
    const definedParams = omitBy(this.propsToQueryParamsShape(), prop => prop === undefined);
    // set null params to undefined
    Object.keys(definedParams).filter(key => definedParams[key] === null).forEach(key => definedParams[key] = undefined);
    return definedParams;
  }

  getQueryParametersFromProps = () => {
    const queryParamsShaped = this.propsToQueryParamsShape();
    Object.keys(queryParamsShaped).filter(key => queryParamsShaped[key] === null).forEach(key => queryParamsShaped[key] = undefined);
    return queryParamsShaped as IQueryParameters; // legal because last line changes null values to undefined
  }

  handleSearchOnChange = (search: string | undefined) => {
    this.search$.next(search);
  }

  loadMore = () => {
    if (!this.state.loadingMore && this.state.hasMore) {
      const incr = this.state.currentPage + 1;
      this.setState({ loadingMore: true, querying: false });
      this.pageNumber$.next(incr);
    }
  }

  handleChangePage = (pageNumber: number) => {
    this.setState({ loadingMore: false, querying: true });
    this.pageNumber$.next(pageNumber);
  }

  handleSortOnChange = (sort: Sort) => {
    if (sort !== this.state.sort) {
      this.setState({ sort, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  // ----------------- merged params -------------
  // ----------------- simple --------------------
  // if the props deliberately set the one of these, you can't change it back
  // via the methods.
  handlePhaseOnChange = (phase: string | undefined) => {
    if (!this.props.phaseId) {
      this.setState({ phase, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleIdeaStatusOnChange = (idea_status: string) => {
    if (!this.props.ideaStatusId) {
      this.setState({ idea_status, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleAssigneeOnChange = (assignee: string | undefined) => {
    if (!this.props.assignee) {
      this.setState({ assignee, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handlePublicationStatusOnChange = (publication_status: PublicationStatus) => {
    if (!this.props.publicationStatus) {
      this.setState({ publication_status, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleProjectPublicationStatusOnChange = (project_publication_status: ProjectPublicationStatus) => {
    if (!this.props.projectPublicationStatus) {
      this.setState({ project_publication_status, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleFeedbackFilterOnChange = (feedbackNeeded: boolean) => {
    if (!this.props.feedbackNeeded) {
      this.setState({ feedback_needed: (feedbackNeeded || undefined), loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  // -------------arrays-------------------------
  // if one of these filters was already applied by the props, you can only further filter with these
  // so we pick the ids of the new project filter that are in the props project array
  handleProjectsOnChange = (projects: string[] | undefined) => {
    const { projectIds } = this.props;
    const newProjects = projects;
    if (projectIds && newProjects) {
      newProjects.filter(id => projectIds.includes(id));
    }
    if (newProjects !== this.state.projects) {
      this.setState({ projects: newProjects, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleTopicsOnChange = (topicIds: string[] | undefined) => {
    const { topics } = this.props;

    const newTopics = topicIds;
    if (topics && newTopics) {
      newTopics.filter(id => topics.includes(id));
    }
    if (newTopics !== this.state.topics) {
      this.setState({ topics: newTopics, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  handleAreasOnchange = (areasIds: string[]) => {
    const { areas } = this.props;

    const newAreas = areasIds;
    if (areas && newAreas) {
      newAreas.filter(id => areas.includes(id));
    }
    if (newAreas !== this.state.areas) {
      this.setState({ areas: newAreas, loadingMore: false, querying: true });
      this.pageNumber$.next(1);
    }
  }

  // ---- end merged params methods----

  // resets params to props, unless omitted
  handleResetParams = (paramsToOmit?: (keyof IQueryParameters)[]) => {
    const queryParameters = this.getQueryParametersFromProps();

    if (paramsToOmit && paramsToOmit.length > 0) {
      this.setState({ ...omit(queryParameters, paramsToOmit), loadingMore: false, querying: true  });
    } else {
      this.setState({ ...queryParameters, loadingMore: false, querying: true  });
    }

    this.pageNumber$.next(1);
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangePage: this.handleChangePage,
      onChangeProjects: this.handleProjectsOnChange,
      onChangePhase: this.handlePhaseOnChange,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeSorting: this.handleSortOnChange,
      onChangeTopics: this.handleTopicsOnChange,
      onChangeAreas: this.handleAreasOnchange,
      onChangeIdeaStatus: this.handleIdeaStatusOnChange,
      onChangePublicationStatus: this.handlePublicationStatusOnChange,
      onChangeProjectPublicationStatus: this.handleProjectPublicationStatusOnChange,
      onChangeAssignee: this.handleAssigneeOnChange,
      onChangeFeedbackFilter: this.handleFeedbackFilterOnChange,
      onResetParams: this.handleResetParams,
    });
  }
}
