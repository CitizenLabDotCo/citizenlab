import React from 'react';
import { isString, isEmpty, isEqual } from 'lodash-es';
import {
  Subscription,
  Subject,
  BehaviorSubject,
  combineLatest,
  merge,
} from 'rxjs';
import {
  map,
  startWith,
  distinctUntilChanged,
  tap,
  debounceTime,
  switchMap,
} from 'rxjs/operators';
import { ideasCount } from 'services/stats';
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import shallowCompare from 'utils/shallowCompare';
import { isNilOrError } from 'utils/helperUtils';

export interface InputProps {
  projectIds?: string[];
  phaseId?: string;
  authorId?: string;
  search?: string;
  topics?: string[];
  areas?: string[];
  ideaStatusId?: string;
  projectPublicationStatus?: ProjectPublicationStatus;
  boundingBox?: number[];
  assignee?: string;
  feedbackNeeded?: boolean;
}

interface IQueryParameters {
  projects: string[] | undefined;
  phase: string | undefined;
  author: string | undefined;
  search: string | undefined;
  topics: string[] | undefined;
  areas: string[] | undefined;
  idea_status: string | undefined;
  project_publication_status: ProjectPublicationStatus | undefined;
  bounding_box: number[] | undefined;
  assignee: string | undefined;
  feedback_needed: boolean | undefined;
}

type children = (renderProps: GetIdeasCountChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: (obj: GetIdeasCountChildProps) => JSX.Element | null;
}

export type GetIdeasCountChildProps = State & {
  onChangeProject: (projectIds: string[]) => void;
  onChangePhase: (phaseId: string) => void;
  onChangeSearchTerm: (search: string) => void;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeIdeaStatus: (ideaStatus: string) => void;
  onChangeProjectPublicationStatus: (
    ProjectPublicationStatus: ProjectPublicationStatus
  ) => void;
  onChangeAssignee: (assignee: string | undefined) => void;
  onChangeFeedbackFilter: (feedbackNeeded: boolean) => void;
};

interface State {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  count: number | undefined | null | Error;
  querying: boolean;
}

export default class GetIdeasCount extends React.Component<Props, State> {
  queryParameters$: BehaviorSubject<IQueryParameters>;
  search$: Subject<string | undefined>;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        projects: undefined,
        phase: undefined,
        author: undefined,
        search: undefined,
        topics: undefined,
        areas: undefined,
        idea_status: undefined,
        project_publication_status: undefined,
        bounding_box: undefined,
        assignee: undefined,
        feedback_needed: undefined,
      },
      searchValue: undefined,
      count: undefined,
      querying: true,
    };
    const queryParameters = this.getQueryParameters(this.state, props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.search$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const queryParametersInput$ = this.queryParameters$.pipe(
      distinctUntilChanged((x, y) => shallowCompare(x, y))
    );
    const queryParametersSearch$ = queryParametersInput$.pipe(
      map((queryParameters) => queryParameters.search),
      distinctUntilChanged()
    );
    const search$ = merge(
      this.search$.pipe(
        tap((searchValue) => this.setState({ searchValue })),
        debounceTime(500)
      ),
      queryParametersSearch$.pipe(
        tap((searchValue) => this.setState({ searchValue }))
      )
    ).pipe(
      startWith(queryParameters.search),
      map((searchValue) =>
        isString(searchValue) && !isEmpty(searchValue) ? searchValue : undefined
      ),
      distinctUntilChanged()
    );

    const queryParametersOutput$ = combineLatest([
      queryParametersInput$,
      search$,
    ]).pipe(
      map(([queryParameters, search]) => ({ ...queryParameters, search }))
    );

    this.subscriptions = [
      queryParametersOutput$
        .pipe(
          switchMap((queryParameters) => {
            return ideasCount({
              queryParameters,
            }).observable.pipe(
              map((ideasCount) => ({ queryParameters, ideasCount }))
            );
          })
        )
        .subscribe(({ ideasCount, queryParameters }) => {
          this.setState({
            queryParameters,
            count: isNilOrError(ideasCount) ? ideasCount : ideasCount.count,
            querying: false,
          });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: _prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: _nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    const inputPropsQueryParameters: IQueryParameters = {
      projects: props.projectIds,
      phase: props.phaseId,
      author: props.authorId,
      search: props.search,
      topics: props.topics,
      areas: props.areas,
      idea_status: props.ideaStatusId,
      project_publication_status: props.projectPublicationStatus,
      bounding_box: props.boundingBox,
      assignee: props.assignee,
      feedback_needed: props.feedbackNeeded,
    };

    return {
      ...state.queryParameters,
      ...inputPropsQueryParameters,
    };
  };

  handleProjectOnChange = (projectIds: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      projects: projectIds,
    });
  };

  handlePhaseOnChange = (phaseId: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      phase: phaseId,
    });
  };

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  };

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics,
    });
  };

  handleAreasOnchange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas,
    });
  };

  handleIdeaStatusOnChange = (ideaStatus: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      idea_status: ideaStatus,
    });
  };

  handleProjectPublicationStatusOnChange = (
    projectPublicationStatus: ProjectPublicationStatus
  ) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      project_publication_status: projectPublicationStatus,
    });
  };

  handleAssigneeOnChange = (assignee: string | undefined) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      assignee,
    });
  };

  handleFeedbackFilterOnChange = (feedbackNeeded: boolean) => {
    if (feedbackNeeded === true) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        feedback_needed: true,
      });
    } else if (feedbackNeeded === false) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        feedback_needed: undefined,
      });
    }
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onChangeProject: this.handleProjectOnChange,
      onChangePhase: this.handlePhaseOnChange,
      onChangeSearchTerm: this.handleSearchOnChange,
      onChangeTopics: this.handleTopicsOnChange,
      onChangeAreas: this.handleAreasOnchange,
      onChangeIdeaStatus: this.handleIdeaStatusOnChange,
      onChangeProjectPublicationStatus:
        this.handleProjectPublicationStatusOnChange,
      onChangeAssignee: this.handleAssigneeOnChange,
      onChangeFeedbackFilter: this.handleFeedbackFilterOnChange,
    });
  }
}
