import * as React from 'react';
import { isObject, isEmpty, isEqual, has } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ProjectCard from 'components/ProjectCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';

// services
import { projectsStream, IProjects } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 200px;
  background: #fff;
  border-radius: 6px;
  border: solid 1px #eee;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectsList: any = styled.div``;

const LoadMore = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  border-radius: 5px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  background: #fff;
`;

const ProjectIcon = styled(Icon)`
  height: 45px;
  fill: #999;
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: #999;
  font-size: 18px;
  font-weight: 400;
  line-height: 25px;
  text-align: center;
`;

const LoadMoreButton = styled(Button)``;

interface IAccumulator {
  pageNumber: number;
  projects: IProjects;
  filter: object;
  hasMore: boolean;
}

type Props = {
  filter: { [key: string]: any };
  loadMoreEnabled?: boolean | undefined;
};

type State = {
  projects: IProjects | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

export default class ProjectCards extends React.PureComponent<Props, State> {
  filter$: Rx.BehaviorSubject<object>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  static defaultProps: Partial<Props> = {
    loadMoreEnabled: true
  };

  constructor(props: Props) {
    super(props as any);
    this.state = {
      projects: null,
      hasMore: false,
      loading: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    this.filter$ = new Rx.BehaviorSubject(this.props.filter);
    this.loadMore$ = new Rx.BehaviorSubject(false);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.filter$
          .map(filter => (isObject(filter) && !isEmpty(filter) ? filter : {}))
          .distinctUntilChanged((x, y) => isEqual(x, y)),
        this.loadMore$,
        (filter, loadMore) => ({ filter, loadMore })
      ).mergeScan<{ filter: object, loadMore: boolean }, IAccumulator>((acc, { filter, loadMore }) => {
        const hasFilterChanged = (!isEqual(acc.filter, filter) || !loadMore);
        const pageNumber = (hasFilterChanged ? 1 : acc.pageNumber + 1);

        this.setState({ loading: hasFilterChanged, loadingMore: !hasFilterChanged });

        return projectsStream({
          queryParameters: {
            'page[size]': 25,
            sort: 'new',
            ...filter,
            'page[number]': pageNumber
          }
        }).observable.map((projects) => ({
          pageNumber,
          filter,
          projects: (hasFilterChanged ? projects : { data: [...acc.projects.data, ...projects.data] }) as IProjects,
          hasMore: has(projects, 'links.next')
        }));
      }, {
        projects: {} as IProjects,
        filter: {},
        pageNumber: 1,
        hasMore: false
      }).subscribe(({ projects, hasMore }) => {
        this.setState({ projects, hasMore, loading: false, loadingMore: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentWillReceiveProps(nextProps: Props) {
    this.filter$.next(nextProps.filter);
  }

  loadMoreProjects = () => {
    this.loadMore$.next(true);
  }

  render() {
    const { projects, hasMore, loading, loadingMore } = this.state;
    const { loadMoreEnabled } = this.props;
    const showLoadmore = (!!loadMoreEnabled && hasMore);
    const hasProjects = (projects !== null && projects.data.length > 0);

    const loadingIndicator = (loading ? (
      <Loading id="projects-loading">
        <Spinner size="30px" color="#666" />
      </Loading>
    ) : null);

    const loadMore = ((!loading && hasProjects && showLoadmore) ? (
      <LoadMore>
        <LoadMoreButton
          text={<FormattedMessage {...messages.loadMore} />}
          processing={loadingMore}
          style="primary"
          size="2"
          onClick={this.loadMoreProjects}
          circularCorners={false}
        />
      </LoadMore>
    ) : null);

    const empty = ((!loading && !hasProjects) ? (
      <EmptyContainer id="projects-empty">
        <ProjectIcon name="idea" />
        <EmptyMessage>
          <EmptyMessageLine>
            <FormattedMessage {...messages.noProjects} />
          </EmptyMessageLine>
        </EmptyMessage>
      </EmptyContainer>
    ) : null);

    const projectsList = ((!loading && hasProjects && projects) ? (
      <ProjectsList id="e2e-projects-list">
        {projects.data.map((project) => (
          <ProjectCard key={project.id} id={project.id} />
        ))}
      </ProjectsList>
    ) : null);

    return (
      <Container id="e2e-projects-container">
        {loadingIndicator}
        {empty}
        {projectsList}
        {loadMore}
      </Container>
    );
  }
}
