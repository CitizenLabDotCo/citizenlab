import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { size, isEqual, isEmpty, isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';
import { updateAppConfiguration } from 'services/appConfiguration';
import { Multiloc } from 'typings';
import { EditModeContext } from 'context';

// components
import ProjectCard from 'components/ProjectCard';
import SelectAreas from './SelectAreas';
import LoadingBox from './LoadingBox';
import Button from 'components/UI/Button';
import Modal, { ModalContentContainer } from 'components/UI/Modal';
import {
  Success,
  Error,
  InputMultilocWithLocaleSwitcher,
} from 'cl2-component-library';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import GetAppConfigurationLocales, {
  GetAppConfigurationLocalesChildProps,
} from 'resources/GetAppConfigurationLocales';

// services
import {
  IAdminPublicationContent,
  InputProps as UseAdminPublicationInputProps,
} from 'hooks/useAdminPublications';

// routing
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import T from 'components/T';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import {
  media,
  fontSizes,
  colors,
  viewportWidths,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { rgba } from 'polished';

// svg
import EmptyProjectsImageSrc from 'assets/img/landingpage/no_projects_image.svg';
import Outlet from 'components/Outlet';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;

  ${media.smallerThanMinTablet`
    justify-content: center;
    border: none;
  `};

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100%;

  ${media.smallerThanMinTablet`
    text-align: center;
    margin: 0;
  `};

  ${isRtl`
    margin-right: 0;
    margin-left: 45px;
    justify-content: flex-end;
  `}
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
  position: relative;
  ${defaultCardStyle};
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

const FiltersArea = styled.div`
  margin-left: auto;

  ${media.smallerThanMinTablet`
    display: none;
  `};

  ${isRtl`
    justify-content: flex-start;
  `}
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

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ShowMoreButton = styled(Button)``;
const EditTitleButton = styled(Button)``;

const StyledInputWithLocaleSwitcher = styled(InputMultilocWithLocaleSwitcher)`
  margin-bottom: 30px;
`;

const ModalButtons = styled.div`
  display: flex;
  margin-bottom: 10px;
`;
const SaveButton = styled(Button)`
  margin-right: 3px;
`;
const CancelButton = styled(Button)``;

interface InputProps extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: 'dynamic' | 'threecolumns' | 'twocolumns';
}

interface DataProps {
  locales: GetAppConfigurationLocalesChildProps;
  tenant: GetAppConfigurationChildProps;
  windowSize: GetWindowSizeChildProps;
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  cardSizes: ('small' | 'medium' | 'large')[];
  areas: string[];
  editTitleOpened: boolean;
  newCurrentlyWorkingOnMultiloc: Multiloc | null;
  loading: boolean;
  saving: 'success' | 'error' | null;
}

class ProjectAndFolderCards extends PureComponent<
  Props & InjectedLocalized & InjectedIntlProps & WithRouterProps,
  State
> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {
      cardSizes: [],
      areas: [],
      editTitleOpened: false,
      newCurrentlyWorkingOnMultiloc: null,
      loading: false,
      saving: null,
    };
  }

  componentDidMount() {
    this.calculateCardsLayout();
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    this.calculateCardsLayout();

    const areas = this.getAreasFromQueryParams();

    if (!isEqual(this.state.areas, areas)) {
      this.setState({ areas });
    }

    const { adminPublications } = this.props;
    if (
      !isEqual(prevState.areas, this.state.areas) &&
      !isNilOrError(adminPublications)
    ) {
      adminPublications.onChangeAreas(this.state.areas);
    }
  }

  calculateCardsLayout = () => {
    const { adminPublications, windowSize, layout } = this.props;

    if (
      !isNilOrError(adminPublications) &&
      adminPublications.list &&
      adminPublications.list.length > 0 &&
      windowSize &&
      layout === 'dynamic'
    ) {
      const initialCount = size(adminPublications.list.slice(0, 6));
      const isOdd = (number: number) => number % 2 === 1;
      const biggerThanSmallTablet = windowSize >= viewportWidths.smallTablet;
      const biggerThanLargeTablet = windowSize >= viewportWidths.largeTablet;

      const cardSizes = adminPublications.list.map((_project, index) => {
        let cardSize: 'small' | 'medium' | 'large' =
          biggerThanSmallTablet && !biggerThanLargeTablet ? 'medium' : 'small';

        if (index < 6) {
          if (biggerThanSmallTablet && !biggerThanLargeTablet) {
            if (
              (!isOdd(initialCount) && (index === 0 || index === 1)) ||
              (isOdd(initialCount) && index === 0)
            ) {
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
  };

  getAreasFromQueryParams = () => {
    let areas: string[] = [];
    const { query } = this.props.location;

    if (query.areas && !isEmpty(query.areas)) {
      areas = isString(query.areas) ? [query.areas] : query.areas;
    }

    return areas;
  };

  showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    this.props.adminPublications.onLoadMore();
  };

  handleAreasOnChange = (areas: string[]) => {
    if (!isEqual(this.state.areas, areas)) {
      trackEventByName(tracks.clickOnProjectsAreaFilter);
      const { pathname } = removeLocale(this.props.location.pathname);
      const query = { ...this.props.location.query, areas };
      const search = `?${stringify(query, { indices: false, encode: false })}`;
      clHistory.replace({ pathname, search });
    }
  };

  editTitle = () => {
    this.setState({
      editTitleOpened: true,
    });
  };

  cancelTitleEdit = () => {
    this.setState({
      editTitleOpened: false,
    });
  };

  onChangeCustomCurrentlyWorkingOn = (
    newCurrentlyWorkingOnMultiloc: Multiloc
  ) => {
    this.setState({
      newCurrentlyWorkingOnMultiloc,
    });
  };

  saveTitle = async (event) => {
    event.preventDefault();

    try {
      this.setState({ loading: true });
      await updateAppConfiguration({
        settings: {
          core: {
            currently_working_on_text: this.state.newCurrentlyWorkingOnMultiloc,
          },
        },
      });
      this.setState({
        loading: false,
        saving: 'success',
        newCurrentlyWorkingOnMultiloc: null,
      });
      setTimeout(() => {
        this.setState({ saving: null });
      }, 4000);
    } catch (error) {
      this.setState({ loading: false, saving: 'error' });
    }
  };

  render() {
    const { cardSizes, areas, editTitleOpened, loading, saving } = this.state;
    const {
      tenant,
      showTitle,
      layout,
      theme,
      adminPublications,
      locales,
      localize,
      intl: { formatMessage },
    } = this.props;
    const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
    const hasPublications = list && list.length > 0;
    const objectFitCoverSupported =
      window['CSS'] && CSS.supports('object-fit: cover');

    if (!isNilOrError(tenant) && !isNilOrError(locales)) {
      const customCurrentlyWorkingOn =
        tenant.attributes.settings.core.currently_working_on_text;

      return (
        <Container id="e2e-projects-container">
          <Header>
            {showTitle ? (
              <TitleContainer>
                <Title>
                  {customCurrentlyWorkingOn &&
                  !isEmpty(customCurrentlyWorkingOn) ? (
                    <T value={customCurrentlyWorkingOn} />
                  ) : (
                    <FormattedMessage {...messages.currentlyWorkingOn} />
                  )}
                </Title>

                <EditModeContext.Consumer>
                  {({ mode }) => {
                    return mode ? (
                      <>
                        <EditTitleButton
                          icon="edit"
                          buttonStyle="text"
                          onClick={this.editTitle}
                          fontSize="16px"
                        >
                          Edit
                        </EditTitleButton>
                        <Modal
                          header="Settings"
                          close={this.cancelTitleEdit}
                          opened={editTitleOpened}
                        >
                          <ModalContentContainer>
                            <StyledInputWithLocaleSwitcher
                              type="text"
                              locales={locales}
                              valueMultiloc={
                                this.state.newCurrentlyWorkingOnMultiloc ||
                                customCurrentlyWorkingOn
                              }
                              label={'Projects header'}
                              onChange={this.onChangeCustomCurrentlyWorkingOn}
                              labelTooltipText={`If this field is empty, a default text '... is currently
                                          working on' will be shown instead.`}
                            />

                            <ModalButtons>
                              <SaveButton
                                disabled={
                                  this.state.newCurrentlyWorkingOnMultiloc ===
                                  null
                                }
                                processing={loading}
                                onClick={this.saveTitle}
                              >
                                Save
                              </SaveButton>
                              <CancelButton
                                buttonStyle="text"
                                onClick={this.cancelTitleEdit}
                              >
                                Cancel
                              </CancelButton>
                            </ModalButtons>
                            {saving === 'success' && (
                              <Success
                                showBackground
                                text="Successfully updated setting."
                              />
                            )}
                            {saving === 'error' && (
                              <Error>Failed updating setting. Try again.</Error>
                            )}
                          </ModalContentContainer>
                        </Modal>
                      </>
                    ) : null;
                  }}
                </EditModeContext.Consumer>
              </TitleContainer>
            ) : (
              <ScreenReaderOnly>
                {customCurrentlyWorkingOn &&
                !isEmpty(customCurrentlyWorkingOn) ? (
                  <T value={customCurrentlyWorkingOn} />
                ) : (
                  <FormattedMessage {...messages.currentlyWorkingOn} />
                )}
              </ScreenReaderOnly>
            )}
            <FiltersArea>
              <FilterArea>
                <SelectAreas
                  selectedAreas={areas}
                  onChange={this.handleAreasOnChange}
                />
              </FilterArea>
            </FiltersArea>
          </Header>

          {loadingInitial && <LoadingBox />}

          {!loadingInitial && !hasPublications && (
            <EmptyContainer id="projects-empty">
              <EmptyProjectsImage
                src={EmptyProjectsImageSrc}
                className={
                  objectFitCoverSupported ? 'objectFitCoverSupported' : ''
                }
              />
              <EmptyMessage>
                <EmptyMessageTitle>
                  <FormattedMessage {...messages.noProjectYet} />
                </EmptyMessageTitle>
                <EmptyMessageLine>
                  <FormattedMessage {...messages.stayTuned} />
                </EmptyMessageLine>
              </EmptyMessage>
            </EmptyContainer>
          )}

          {!loadingInitial && hasPublications && list && (
            <ProjectsList id="e2e-projects-list">
              {list.map((item: IAdminPublicationContent, index: number) => {
                const projectOrFolderId = item.publicationId;
                const projectOrFolderType = item.publicationType;
                const size =
                  layout === 'dynamic'
                    ? cardSizes[index]
                    : layout === 'threecolumns'
                    ? 'small'
                    : 'medium';

                return (
                  <React.Fragment key={index}>
                    {projectOrFolderType === 'project' && (
                      <ProjectCard
                        projectId={projectOrFolderId}
                        size={size}
                        layout={layout}
                      />
                    )}
                    <Outlet
                      id="app.components.ProjectAndFolderCards.card"
                      publication={item}
                      size={size}
                      layout={layout}
                    />
                  </React.Fragment>
                );
              })}

              {/*
              // A bit of a hack (but the most elegant one I could think of) to
              // make the 3-column layout work for the last row of project cards when
              // the total amount of projects is not divisible by 3 and therefore doesn't take up the full row width.
              // Ideally would have been solved with CSS grid, but... IE11
              */}
              {!hasMore &&
                (layout === 'threecolumns' || list.length > 6) &&
                (list.length + 1) % 3 === 0 && (
                  <MockProjectCard className={layout} />
                )}

              {!hasMore &&
                (layout === 'threecolumns' || list.length > 6) &&
                (list.length - 1) % 3 === 0 && (
                  <>
                    <MockProjectCard className={layout} />
                    <MockProjectCard className={layout} />
                  </>
                )}
            </ProjectsList>
          )}

          <Footer>
            {!loadingInitial && hasPublications && hasMore && (
              <ShowMoreButton
                onClick={this.showMore}
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
                className={`e2e-project-cards-show-more-button ${
                  loadingMore ? 'loading' : ''
                }`}
              />
            )}
          </Footer>
        </Container>
      );
    }

    return null;
  }
}

const ProjectAndFolderCardsWithHOCs = withTheme(
  injectIntl(injectLocalize(ProjectAndFolderCards))
);

const Data = adopt<DataProps, InputProps>({
  locales: <GetAppConfigurationLocales />,
  tenant: <GetAppConfiguration />,
  windowSize: <GetWindowSize />,
  adminPublications: ({ render, ...props }) => (
    <GetAdminPublications
      pageSize={6}
      prefetchProjects
      rootLevelOnly
      removeNotAllowedParents
      {...props}
    >
      {render}
    </GetAdminPublications>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectAndFolderCardsWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
));
