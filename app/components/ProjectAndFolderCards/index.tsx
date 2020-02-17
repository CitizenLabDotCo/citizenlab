import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { size, isEqual, isEmpty } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectCard from 'components/ProjectCard';
import ProjectFolderCard from 'components/ProjectFolderCard';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

// services
import { IProjectHolderOrderingData } from 'services/projectHolderOrderings';

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
import { ScreenReaderOnly } from 'utils/a11y';
import { rgba } from 'polished';

// svg
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;

  ${media.smallerThanMinTablet`
    justify-content: center;
    border: none;
  `};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  display: flex;
  align-items: center;
  padding: 0;
  padding-bottom: 15px;
  margin-right: 45px;

  ${media.smallerThanMinTablet`
    text-align: center;
    margin: 0;
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
  margin-top: 20px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const ShowMoreButton = styled(Button)``;

interface InputProps {
  showTitle: boolean;
  layout: 'dynamic' | 'threecolumns';
}

interface DataProps {
  tenant: GetTenantChildProps;
  windowSize: GetWindowSizeChildProps;
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  cardSizes: ('small' | 'medium' | 'large')[];
  areas: string[];
}

class ProjectAndFolderCards extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {
      cardSizes: [],
      areas: []
    };
  }

  componentDidMount() {
    this.calculateCardsLayout();
  }

  componentDidUpdate() {
    this.calculateCardsLayout();
  }

  calculateCardsLayout = () => {
    const { projectHolderOrderings, windowSize, layout } = this.props;

    if (
      !isNilOrError(projectHolderOrderings) &&
      projectHolderOrderings.list &&
      projectHolderOrderings.list.length > 0 &&
      windowSize &&
      layout === 'dynamic'
    ) {
      const initialCount = size(projectHolderOrderings.list.slice(0, 6));
      const isOdd = (number: number) => number % 2 === 1;
      const biggerThanSmallTablet = (windowSize >= viewportWidths.smallTablet);
      const biggerThanLargeTablet = (windowSize >= viewportWidths.largeTablet);

      const cardSizes = projectHolderOrderings.list.map((_project, index) => {
        let cardSize: 'small' | 'medium' | 'large' = (biggerThanSmallTablet && !biggerThanLargeTablet ? 'medium' : 'small');

        if (index < 6) {
          if (biggerThanSmallTablet && !biggerThanLargeTablet) {
            if ((!isOdd(initialCount) && (index === 0 || index === 1)) || (isOdd(initialCount) && index === 0)) {
              cardSize = 'large';
            }
          }

          if (biggerThanLargeTablet) {
            if (initialCount === 1 && index === 0) {
              cardSize = 'large';
            } else if (initialCount === 2) {
              cardSize = 'medium';
            } else if (initialCount === 3) {
              if (index === 0) {
                cardSize = 'large';
              } else {
                cardSize = 'medium';
              }
            } else if (initialCount === 4 && index === 0) {
              cardSize = 'large';
            } else if (initialCount === 5 && (index === 0 || index === 1)) {
              cardSize = 'medium';
            } else if (initialCount === 6) {
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
    this.props.projectHolderOrderings.onLoadMore();
  }

  render() {
    const { cardSizes } = this.state;
    const { tenant, showTitle, layout, theme, projectHolderOrderings } = this.props;
    const { loadingInitial, loadingMore, hasMore } = projectHolderOrderings;
    const hasProjects = !isNilOrError(projectHolderOrderings) && projectHolderOrderings.list && projectHolderOrderings.list.length > 0;
    const objectFitCoverSupported = (window['CSS'] && CSS.supports('object-fit: cover'));

    if (!isNilOrError(tenant)) {
      const customCurrentlyWorkingOn = tenant.attributes.settings.core.currently_working_on_text;

      return (
        <Container id="e2e-projects-container">
          <Header>
            {showTitle ? (
              <Title>
                {customCurrentlyWorkingOn && !isEmpty(customCurrentlyWorkingOn)
                  ? <T value={customCurrentlyWorkingOn} />
                  : <FormattedMessage {...messages.currentlyWorkingOn} />
                }
              </Title>
            ) : (
              <ScreenReaderOnly>
                {customCurrentlyWorkingOn && !isEmpty(customCurrentlyWorkingOn)
                  ? <T value={customCurrentlyWorkingOn} />
                  : <FormattedMessage {...messages.currentlyWorkingOn} />
                }
              </ScreenReaderOnly>
            )}
          </Header>

          {loadingInitial &&
            <Loading id="projects-loading">
              <Spinner />
            </Loading>
          }

          {!loadingInitial && !hasProjects &&
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

          {!loadingInitial && !isNilOrError(projectHolderOrderings) && projectHolderOrderings.list && projectHolderOrderings.list.length > 0 && (
            <ProjectsList id="e2e-projects-list">
              {projectHolderOrderings.list.map((item: IProjectHolderOrderingData, index: number) => {
                  const projectOrFolderId = item.relationships.project_holder.data.id;
                  const projectOrFolderType = item.relationships.project_holder.data.type;
                  const size = (layout === 'dynamic' ? cardSizes[index] : 'small');

                  return (
                    <React.Fragment key={index}>
                      {projectOrFolderType === 'project' ? (
                        <ProjectCard
                          projectId={projectOrFolderId}
                          size={size}
                          layout={layout}
                        />
                      ) : (
                        <ProjectFolderCard
                          projectFolderId={projectOrFolderId}
                          size={size}
                          layout={layout}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              )}

              {/*
              // A bit of a hack (but the most elegant one I could think of) to
              // make the 3-column layout work for the last row of project cards when
              // the total amount of projects is not divisible by 3 and therefore doesn't take up the full row width.
              // Ideally would have been solved with CSS grid, but... IE11
              */}
              {!hasMore && (layout === 'threecolumns' || projectHolderOrderings.list.length > 6) && (projectHolderOrderings.list.length + 1) % 3 === 0 &&
                <MockProjectCard className={layout} />
              }

              {!hasMore && (layout === 'threecolumns' || projectHolderOrderings.list.length > 6) && (projectHolderOrderings.list.length - 1) % 3 === 0 &&
                <>
                  <MockProjectCard className={layout} />
                  <MockProjectCard className={layout} />
                </>
              }
            </ProjectsList>
          )}

          <Footer>
            {!loadingInitial && hasProjects && hasMore &&
              <ShowMoreButton
                onClick={this.showMore}
                size="1"
                buttonStyle="secondary"
                text={<FormattedMessage {...messages.showMore} />}
                processing={loadingMore}
                height="50px"
                icon="showMore"
                iconPos="left"
                textColor={theme.colorText}
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

const ProjectAndFolderCardsWithHOCs = withTheme(injectIntl<Props>(withRouter(ProjectAndFolderCards)));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  windowSize: <GetWindowSize />,
  projectHolderOrderings: <GetProjectHolderOrderings />
});

// TODO: tracks

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectAndFolderCardsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
