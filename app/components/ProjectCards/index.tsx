import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { size, isEqual, isEmpty, isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { stringify } from 'qs';
import clHistory from 'utils/cl-router/history';

// components
import ProjectCard from 'components/ProjectCard';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';
import SelectAreas from './SelectAreas';
import SelectPublicationStatus from './SelectPublicationStatus';

// resources
import GetProjects, { GetProjectsChildProps, InputProps as GetProjectsInputProps, SelectedPublicationStatus  } from 'resources/GetProjects';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes, viewportWidths, colors } from 'utils/styleUtils';
import { rgba } from 'polished';

const EmptyProjectsImageSrc: string = require('assets/img/landingpage/no_projects_image.svg');

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
  border-bottom: 1px solid #d1d1d1;

  ${media.smallerThanMinTablet`
    justify-content: center;
    border: none;
  `};
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colorText};
  margin: 0;
  margin-right: 45px;
  font-weight: 500;
  font-size: ${fontSizes.xl}px;

  ${media.smallerThanMinTablet`
    margin: 0;
    font-size: ${fontSizes.large}px;
    text-align: center;
  `};
`;

const FiltersArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  &.fullWidth {
    width: 100%;
    justify-content: space-between;

    ${media.smallerThanMinTablet`
      justify-content: flex-start;
    `};
  }

  &.alignRight {
    justify-content: flex-end;

    ${media.smallerThanMinTablet`
      display: none;
    `};
  }
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  &.publicationstatus {
    margin-right: 30px;
  }

  ${media.smallerThanMinTablet`
    height: auto;
  `};
`;

const ProjectsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const MockProjectCard = styled.div`
  height: 1px;
  background: transparent;
  width: calc(33% - 12px);
`;

const EmptyContainer = styled.div`
  width: 100%;
  min-height: 200px;
  color: ${({ theme }) => theme.colorText};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0;
  margin-bottom: 43px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  position: relative;
  background: #fff;
  border: solid 1px ${colors.separation};
`;

const EmptyProjectsImage = styled.img`
  width: 100%;
  height: auto;

  ${media.smallerThanMaxTablet`
    &.objectFitCoverSupported {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:not(.objectFitCoverSupported) {
      width: auto;
      height: 100%;
    }
  `}
`;

const EmptyMessage = styled.div`
  color: ${({ theme }) => theme.colorText};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const EmptyMessageTitle = styled.h2`
  font-weight: 600;
  font-size: ${fontSizes.xl}px;
  white-space: nowrap;
  margin-bottom: 5px;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
  `};
`;

const EmptyMessageLine = styled.p`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 25px;
  text-align: center;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;


  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const ShowMoreButton = styled(Button)``;

interface InputProps extends GetProjectsInputProps {
  showTitle: boolean;
  showPublicationStatusFilter: boolean;
  layout: 'dynamic' | 'threecolumns';
}

interface DataProps {
  projects: GetProjectsChildProps;
  tenant: GetTenantChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  cardSizes: ('small' | 'medium' | 'large')[];
  areas: string[];
}

class ProjectCards extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {
      cardSizes: [],
      areas: []
    };
  }

  componentDidMount() {
    this.calculateProjectCardsLayout();
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    this.calculateProjectCardsLayout();

    const areas = this.getAreasFromQueryParams();

    if (!isEqual(this.state.areas, areas)) {
      this.setState({ areas });
    }

    if (!isEqual(prevState.areas, this.state.areas)) {
      this.props.projects.onChangeAreas(this.state.areas);
    }
  }

  getAreasFromQueryParams = () => {
    let areas: string[] = [];
    const { query } = this.props.location;

    if (query.areas && !isEmpty(query.areas)) {
      areas = (isString(query.areas) ? [query.areas] : query.areas);
    }

    return areas;
  }

  calculateProjectCardsLayout = () => {
    const { projects, windowSize, layout } = this.props;

    if (
      !isNilOrError(projects) &&
      projects.projectsList &&
      projects.projectsList.length > 0 &&
      windowSize &&
      layout === 'dynamic'
    ) {
      const { projectsList } = projects;
      const initialProjectsCount = size(projectsList.slice(0, 6));
      const isOdd = (number: number) => number % 2 === 1;
      const biggerThanSmallTablet = (windowSize >= viewportWidths.smallTablet);
      const biggerThanLargeTablet = (windowSize >= viewportWidths.largeTablet);

      const cardSizes = projectsList.map((_project, index) => {
        let cardSize: 'small' | 'medium' | 'large' = (biggerThanSmallTablet && !biggerThanLargeTablet ? 'medium' : 'small');

        if (index < 6) {
          if (biggerThanSmallTablet && !biggerThanLargeTablet) {
            if ((!isOdd(initialProjectsCount) && (index === 0 || index === 1)) || (isOdd(initialProjectsCount) && index === 0)) {
              cardSize = 'large';
            }
          }

          if (biggerThanLargeTablet) {
            if (initialProjectsCount === 1 && index === 0) {
              cardSize = 'large';
            } else if (initialProjectsCount === 2) {
              cardSize = 'medium';
            } else if (initialProjectsCount === 3) {
              if (index === 0) {
                cardSize = 'large';
              } else {
                cardSize = 'medium';
              }
            } else if (initialProjectsCount === 4 && index === 0) {
              cardSize = 'large';
            } else if (initialProjectsCount === 5 && (index === 0 || index === 1)) {
              cardSize = 'medium';
            } else if (initialProjectsCount === 6) {
              if (index === 0) {
                cardSize = 'large';
              } else if (index === 1 || index === 2) {
                cardSize = 'medium';
              }
            }
          }
        }

        return cardSize;
      });

      if (!isEqual(this.state.cardSizes, cardSizes)) {
        this.setState({ cardSizes });
      }
    }
  }

  showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    this.props.projects.onLoadMore();
  }

  handlePublicationStatusOnChange = (status: SelectedPublicationStatus) => {
    trackEventByName(tracks.clickOnProjectsPublicationStatusFilter);
    this.props.projects.onChangePublicationStatus(status);
  }

  handleAreasOnChange = (areas: string[]) => {
    if (!isEqual(this.state.areas, areas)) {
      trackEventByName(tracks.clickOnProjectsAreaFilter);
      const { pathname } = removeLocale(this.props.location.pathname);
      const query = { ...this.props.location.query, areas };
      const search = `?${stringify(query, { indices: false, encode: false })}`;
      clHistory.replace({ pathname, search });
    }
  }

  render() {
    const { cardSizes } = this.state;
    const { tenant, showTitle, showPublicationStatusFilter, layout, theme } = this.props;
    const { queryParameters, projectsList, hasMore, querying, loadingMore } = this.props.projects;
    const hasProjects = (projectsList && projectsList.length > 0);
    const selectedAreas = (queryParameters.areas || this.emptyArray);
    const objectFitCoverSupported = (window['CSS'] && CSS.supports('object-fit: cover'));

    if (!isNilOrError(tenant)) {
      const customCurrentlyWorkingOn = tenant.attributes.settings.core.currently_working_on_text;

      return (
        <Container id="e2e-projects-container">
          <Header>
            {showTitle &&
              <Title>
                {customCurrentlyWorkingOn && !isEmpty(customCurrentlyWorkingOn)
                  ?
                    <T value={customCurrentlyWorkingOn} />
                  :
                    <FormattedMessage
                      {...messages.currentlyWorkingOn}
                    />
                }
              </Title>
            }

            <FiltersArea className={showTitle ? 'alignRight' : 'fullWidth'}>
              {showPublicationStatusFilter &&
                <FilterArea className="publicationstatus">
                  <SelectPublicationStatus onChange={this.handlePublicationStatusOnChange} />
                </FilterArea>
              }

              <FilterArea>
                <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
              </FilterArea>
            </FiltersArea>
          </Header>

          {querying &&
            <Loading id="projects-loading">
              <Spinner />
            </Loading>
          }

          {!querying && !hasProjects &&
            <EmptyContainer id="projects-empty">
              <EmptyProjectsImage src={EmptyProjectsImageSrc} className={objectFitCoverSupported ? 'objectFitCoverSupported' : ''} />
              <EmptyMessage>
                <EmptyMessageTitle>
                  <FormattedMessage {...messages.noProjectYet} />
                </EmptyMessageTitle>
                <EmptyMessageLine>
                  <FormattedMessage {...messages.stayTuned} />
                </EmptyMessageLine>
              </EmptyMessage>
            </EmptyContainer>
          }

          {!querying && hasProjects && projectsList && (
            <ProjectsList id="e2e-projects-list">
              {projectsList.map((project, index) => {
                const size = (layout === 'dynamic' ? cardSizes[index] : 'small');
                return <ProjectCard key={project.id} projectId={project.id} size={size} layout={layout} />;
              })}

              {/*
              // A bit of a hack (but the most elegant one I could think of) to
              // make the 3-column layout work for the last row of project cards when
              // the total amount of projects is not divisible by 3 and therefore doesn't take up the full row width.
              // Ideally would have been solved with CSS grid, but... IE11
              */}
              {!hasMore && (layout === 'threecolumns' || projectsList.length > 6)  && (projectsList.length + 1) % 3 === 0 &&
                <MockProjectCard className={layout} />
              }

              {!hasMore && (layout === 'threecolumns' || projectsList.length > 6) && (projectsList.length - 1) % 3 === 0 &&
                <>
                  <MockProjectCard className={layout} />
                  <MockProjectCard className={layout} />
                </>
              }
            </ProjectsList>
          )}

          <Footer>
            {!querying && hasProjects && hasMore &&
              <ShowMoreButton
                onClick={this.showMore}
                size="1"
                style="secondary"
                text={<FormattedMessage {...messages.showMore} />}
                processing={loadingMore}
                height="50px"
                icon="showMore"
                iconPos="left"
                textColor={theme.colorText}
                textHoverColor="red"
                bgColor={rgba(theme.colorText, 0.08)}
                bgHoverColor={rgba(theme.colorText, 0.12)}
                fontWeight="500"
                className="e2e-project-cards-show-more-button"
              />
            }
          </Footer>
        </Container>
      );
    }

    return null;
  }
}

const ProjectCardsWithHOCs = withTheme(injectIntl<Props>(withRouter(ProjectCards)));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  windowSize: <GetWindowSize />,
  projects: ({ render, ...getProjectsInputProps }) => <GetProjects {...getProjectsInputProps}>{render}</GetProjects>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectCardsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
