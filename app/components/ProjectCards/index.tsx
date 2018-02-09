import * as React from 'react';
import { isObject, isEmpty, isEqual, get, isString } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ProjectCard from 'components/ProjectCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectAreas from './SelectAreas';

// services
import { projectsStream, IProjects } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #e4e4e4;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  ${media.smallerThanMaxTablet`
    margin: 0;
    margin-top: 10px;
    margin-bottom: 30px;
    justify-content: space-between;
  `}
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    align-items: flex-end;
  `}
`;

const ProjectsList: any = styled.div``;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 120px;
  padding-bottom: 120px;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
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

const LoadMoreButton = styled.div`
  flex: 1;
  width: 300px;
  width: 100%;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  border-radius: 5px;
  background: #f0f0f0;
  transition: all 100ms ease-out;

  &:not(.loading) {
    cursor: pointer;

    &:hover {
      color: #000;
      background: #e8e8e8;
    }
  }

  &.loading {
    background: #f0f0f0;
  }
`;

interface IAccumulator {
  pageNumber: number;
  projects: IProjects;
  filter: object;
  hasMore: boolean;
}

type Props = {
  pageSize: number;
};

type State = {
  filter: {
    areas?: string[];
  };
  projects: IProjects | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
};

export default class ProjectCards extends React.PureComponent<Props, State> {
  filter$: Rx.BehaviorSubject<object>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      filter: {
        areas: []
      },
      projects: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { pageSize } = this.props;

    this.filter$ = new Rx.BehaviorSubject(this.state.filter);
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

        this.setState({ filter, querying: hasFilterChanged, loadingMore: !hasFilterChanged });

        return projectsStream({
          queryParameters: {
            'page[size]': pageSize,
            sort: 'new',
            ...filter,
            'page[number]': pageNumber
          }
        }).observable.map((projects) => {
          const selfLink = get(projects, 'links.self');
          const lastLink = get(projects, 'links.last');
          const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

          return {
            pageNumber,
            filter,
            hasMore,
            projects: (hasFilterChanged ? projects : { data: [...acc.projects.data, ...projects.data] }) as IProjects
          };
        });
      }, {
        projects: {} as IProjects,
        filter: {},
        pageNumber: 1,
        hasMore: false
      }).subscribe(({ projects, filter, hasMore }) => {
        this.setState({ projects, filter, hasMore, querying: false, loadingMore: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMoreProjects = () => {
    if (!this.state.loadingMore) {
      this.loadMore$.next(true);
    }
  }

  handleAreasOnChange = (areas: string[]) => {
    this.filter$.next({
      ...this.state.filter,
      areas
    });
  }

  render() {
    const { filter, projects, hasMore, querying, loadingMore } = this.state;
    const hasProjects = (projects !== null && projects.data.length > 0);
    const selectedAreas = (filter.areas || []);

    return (
      <Container id="e2e-projects-container">
        <FiltersArea id="e2e-ideas-filters">
          <FilterArea>
            <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
          </FilterArea>
        </FiltersArea>

        {querying && 
          <Loading id="projects-loading">
            <Spinner size="34px" color="#666" />
          </Loading>
        }

        {!querying && !hasProjects && 
          <EmptyContainer id="projects-empty">
            <ProjectIcon name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage {...messages.noProjects} />
              </EmptyMessageLine>
            </EmptyMessage>
          </EmptyContainer>
        }

        {!querying && hasProjects && projects &&
          <ProjectsList id="e2e-projects-list">
            {projects.data.map((project) => (
              <ProjectCard key={project.id} id={project.id} />
            ))}
          </ProjectsList>
        }

        {!querying && hasMore &&
          <LoadMoreButton className={`${loadingMore && 'loading'}`} onClick={this.loadMoreProjects}>
            {!loadingMore ? <FormattedMessage {...messages.loadMore} /> : <Spinner size="30px" color="#333" />}
          </LoadMoreButton>
        }
      </Container>
    );
  }
}
