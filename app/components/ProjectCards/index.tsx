import * as React from 'react';
import { get, isString, omitBy, isNil } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ProjectCard from 'components/ProjectCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';
import SelectAreas from './SelectAreas';

// services
import { projectsStream, IProjects } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import shallowCompare from 'utils/shallowCompare';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    justify-content: flex-start;
  `};
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    height: 30px;
  `}
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: -13px;
    margin-right: -13px;
  `};
`;

const StyledProjectCard = styled(ProjectCard)`
  ${media.smallerThanMaxTablet`
    flex-grow: 0;
    width: calc(100% * (1/2) - 26px);
    margin-left: 13px;
    margin-right: 13px;
  `};

  ${media.smallerThanMinTablet`
    width: 100%;
  `}
`;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
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

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const LoadMoreButton = styled(Button)``;

interface IQueryParameters {
  'page[number]'?: number | undefined;
  'page[size]'?: number | undefined;
  areas?: string[] | undefined;
}

interface IAccumulator {
  projects: IProjects;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

type Props = {
  queryParameters?: IQueryParameters | undefined;
  hideAllFilters?: boolean | undefined;
};

type State = {
  queryParameters: IQueryParameters;
  projects: IProjects | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
};

export default class ProjectCards extends React.PureComponent<Props, State> {
  queryParameters$: Rx.BehaviorSubject<IQueryParameters>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': 12,
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
    const queryParameters = { ...this.state.queryParameters, ...this.props.queryParameters };
    const startAccumulatorValue: IAccumulator = { queryParameters, projects: {} as IProjects, hasMore: false };

    this.queryParameters$ = new Rx.BehaviorSubject(queryParameters);

    this.subscriptions = [
      this.queryParameters$
      .distinctUntilChanged((x, y) => shallowCompare(x, y))
      .mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
        const isLoadingMore = (acc.queryParameters['page[number]'] !== queryParameters['page[number]']);
        const pageNumber = (isLoadingMore ? queryParameters['page[number]'] : 1);
        const newQueryParameters: IQueryParameters = omitBy({
          ...queryParameters,
          'page[number]': pageNumber
        }, isNil);

        this.setState({
          querying: !isLoadingMore,
          loadingMore: isLoadingMore,
        });

        return projectsStream({ queryParameters: newQueryParameters }).observable.map((projects) => {
          const selfLink = get(projects, 'links.self');
          const lastLink = get(projects, 'links.last');
          const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

          return {
            queryParameters,
            hasMore,
            projects: (!isLoadingMore ? projects : { data: [...acc.projects.data, ...projects.data] }) as IProjects
          };
        });
      }, startAccumulatorValue).subscribe(({ projects, queryParameters, hasMore }) => {
        this.setState({ projects, queryParameters, hasMore, querying: false, loadingMore: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] as number) + 1
      });
    }
  }

  handleAreasOnChange = (areas: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      areas
    });
  }

  render() {
    const { queryParameters, projects, hasMore, querying, loadingMore } = this.state;
    const hasProjects = (projects !== null && projects.data.length > 0);
    const selectedAreas = (queryParameters.areas || []);

    return (
      <Container id="e2e-projects-container">
        {this.props.hideAllFilters !== true &&
          <FiltersArea id="e2e-projects-filters">
            <FilterArea>
              <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
            </FilterArea>
          </FiltersArea>
        }

        {querying && 
          <Loading id="projects-loading">
            <Spinner size="32px" color="#666" />
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
              <StyledProjectCard key={project.id} id={project.id} />
            ))}
          </ProjectsList>
        }

        {!querying && hasMore &&
          <LoadMoreButtonWrapper>
            <LoadMoreButton
              onClick={this.loadMore}
              style="secondary"
              size="2"
              text={<FormattedMessage {...messages.loadMore} />}
              processing={loadingMore}
              circularCorners={false}
              fullWidth={true}
              height="60px"
            />
          </LoadMoreButtonWrapper>
        }
      </Container>
    );
  }
}
