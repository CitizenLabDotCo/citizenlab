import React, { PureComponent, lazy, Suspense } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import TopicFilterDropdown from './TopicFilterDropdown';
import SelectSort from './SortFilterDropdown';
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
const IdeasMap = lazy(() => import('components/IdeasMap'));
import IdeasList from './IdeasList';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetIdeas, {
  Sort,
  GetIdeasChildProps,
  InputProps as GetIdeasInputProps,
} from 'resources/GetIdeas';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdeaCustomFieldsSchemas, {
  GetIdeaCustomFieldsSchemasChildProps,
} from 'resources/GetIdeaCustomFieldsSchemas';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';

// typings
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { withRouter, WithRouterProps } from 'react-router';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';

const Container = styled.div`
  width: 100%;
`;

const FiltersArea = styled.div`
  width: 100%;
  min-height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.mapView {
    justify-content: flex-end;
    margin-bottom: 15px;

    ${media.smallerThanMinTablet`
      margin-bottom: 0px;
    `}
  }

  ${media.biggerThanMinTablet`
    &.mapView {
      margin-top: -65px;
    }
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
`;

const LeftFilterArea = styled(FilterArea)`
  flex: 1 1 auto;

  &.hidden {
    display: none;
  }

  ${media.smallerThanMinTablet`
    display: flex;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const RightFilterArea = styled(FilterArea)`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const DesktopViewButtons = styled(ViewButtons)`
  margin-left: 40px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MobileViewButtons = styled(ViewButtons)`
  margin-bottom: 15px;
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0;
    margin-left: auto;
  `}

  ${media.smallerThanMinTablet`
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
    margin-bottom: 20px;
  `}
`;

interface InputProps extends GetIdeasInputProps {
  showViewToggle?: boolean | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
  allowProjectsFilter?: boolean;
}

interface DataProps {
  locale: GetLocaleChildProps;
  windowSize: GetWindowSizeChildProps;
  ideas: GetIdeasChildProps;
  project: GetProjectChildProps;
  ideaCustomFieldsSchemas: GetIdeaCustomFieldsSchemasChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedView: 'card' | 'map';
}

class IdeasWithoutFiltersSidebar extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  static defaultProps = {
    showViewToggle: false,
  };

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selectedView: props.defaultView || 'card',
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.phaseId !== prevProps.phaseId) {
      this.setState({ selectedView: this.props.defaultView || 'card' });
    }
  }

  loadMore = () => {
    trackEventByName(tracks.loadMoreIdeas);
    this.props.ideas.onLoadMore();
  };

  handleSearchOnChange = (search: string) => {
    this.props.ideas.onChangeSearchTerm(search);
  };

  handleProjectsOnChange = (projectIds: string[]) => {
    this.props.ideas.onChangeProjects(projectIds);
  };

  handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });
    this.props.ideas.onChangeSorting(sort);
  };

  handleTopicsOnChange = (topics: string[]) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });
    this.props.ideas.onChangeTopics(topics);
  };

  selectView = (selectedView: 'card' | 'map') => {
    this.setState({ selectedView });
  };

  isFieldEnabled = (fieldCode: CustomFieldCodes) => {
    /*
      If IdeaCards are used in a location that's not inside a project,
      and has no ideaCustomFields settings as such,
      we fall back to true
    */

    const { ideaCustomFieldsSchemas, locale } = this.props;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      return (
        ideaCustomFieldsSchemas.ui_schema_multiloc?.[locale]?.[fieldCode]?.[
          'ui:widget'
        ] !== 'hidden'
      );
    }

    return true;
  };

  render() {
    const { selectedView } = this.state;
    const {
      participationMethod,
      participationContextId,
      participationContextType,
      defaultSortingMethod,
      windowSize,
      ideas,
      className,
      allowProjectsFilter,
      showViewToggle,
      project,
    } = this.props;
    const { queryParameters, list, hasMore, querying, loadingMore } = ideas;
    const hasIdeas = !isNilOrError(list) && list.length > 0;
    const locationEnabled = this.isFieldEnabled('location');
    const topicsEnabled = this.isFieldEnabled('topic_ids');
    const showViewButtons = !!(locationEnabled && showViewToggle);
    const showListView =
      !locationEnabled || (locationEnabled && selectedView === 'card');
    const showMapView = locationEnabled && selectedView === 'map';
    const smallerThanBigTablet = !!(
      windowSize && windowSize <= viewportWidths.largeTablet
    );
    const smallerThanSmallTablet = !!(
      windowSize && windowSize <= viewportWidths.smallTablet
    );
    const biggerThanSmallTablet = !!(
      windowSize && windowSize >= viewportWidths.smallTablet
    );
    const biggerThanLargeTablet = !!(
      windowSize && windowSize >= viewportWidths.largeTablet
    );
    const smallerThan1100px = !!(windowSize && windowSize <= 1100);
    const smallerThanPhone = !!(
      windowSize && windowSize <= viewportWidths.phone
    );

    return (
      <Container
        id="e2e-ideas-container"
        className={`${className || ''} ${showMapView ? 'mapView' : 'listView'}`}
      >
        <FiltersArea
          id="e2e-ideas-filters"
          className={`ideasContainer ${showMapView ? 'mapView' : 'listView'}`}
        >
          <LeftFilterArea>
            {showViewButtons && smallerThanSmallTablet && (
              <MobileViewButtons
                selectedView={selectedView}
                onClick={this.selectView}
              />
            )}

            {!showMapView && (
              <StyledSearchInput
                className="e2e-search-ideas-input"
                onChange={this.handleSearchOnChange}
              />
            )}
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters
              className={`${showMapView ? 'hidden' : 'visible'} ${
                showViewButtons ? 'hasViewButtons' : ''
              }`}
            >
              <SelectSort
                onChange={this.handleSortOnChange}
                alignment={biggerThanLargeTablet ? 'right' : 'left'}
                defaultSortingMethod={defaultSortingMethod || null}
              />
              {allowProjectsFilter && (
                <ProjectFilterDropdown
                  title={<FormattedMessage {...messages.projectFilterTitle} />}
                  onChange={this.handleProjectsOnChange}
                />
              )}
              {topicsEnabled && !isNilOrError(project) && (
                <TopicFilterDropdown
                  onChange={this.handleTopicsOnChange}
                  alignment={biggerThanLargeTablet ? 'right' : 'left'}
                  projectId={project.id}
                />
              )}
            </DropdownFilters>

            {showViewButtons && !smallerThanSmallTablet && (
              <DesktopViewButtons
                selectedView={selectedView}
                onClick={this.selectView}
              />
            )}
          </RightFilterArea>
        </FiltersArea>
        {showListView && list && (
          <IdeasList
            ariaLabelledBy={'view-tab-1'}
            id={'view-panel-1'}
            querying={querying}
            onLoadMore={this.props.ideas.onLoadMore}
            hasMore={hasMore}
            hasIdeas={hasIdeas}
            loadingMore={loadingMore}
            list={list}
            participationMethod={participationMethod}
            participationContextId={participationContextId}
            participationContextType={participationContextType}
            tabIndex={0}
            hideImage={smallerThanBigTablet && biggerThanSmallTablet}
            hideImagePlaceholder={smallerThanBigTablet}
            hideIdeaStatus={
              (biggerThanLargeTablet && smallerThan1100px) || smallerThanPhone
            }
          />
        )}
        {showMapView && (
          <Suspense fallback={false}>
            <IdeasMap
              ariaLabelledBy={'view-tab-2'}
              id={'view-panel-2'}
              projectIds={queryParameters.projects}
              phaseId={queryParameters.phase}
              tabIndex={0}
            />
          </Suspense>
        )}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  windowSize: <GetWindowSize />,
  ideas: ({ render, ...getIdeasInputProps }) => (
    <GetIdeas
      {...getIdeasInputProps}
      pageSize={24}
      sort={
        getIdeasInputProps.defaultSortingMethod || ideaDefaultSortMethodFallback
      }
    >
      {render}
    </GetIdeas>
  ),
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  ideaCustomFieldsSchemas: ({ project, render }) => {
    return (
      <GetIdeaCustomFieldsSchemas
        projectId={!isNilOrError(project) ? project.id : null}
      >
        {render}
      </GetIdeaCustomFieldsSchemas>
    );
  },
});

const IdeasWithoutFiltersSidebarWithHoCs = injectIntl(
  IdeasWithoutFiltersSidebar
);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <IdeasWithoutFiltersSidebarWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
));
