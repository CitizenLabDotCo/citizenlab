import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, isEmpty, isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// components
import Header from './components/Header';
import EmptyContainer from './components/EmptyContainer';
import ProjectCard from 'components/ProjectCard';
import LoadingBox from './components/LoadingBox';
import Button from 'components/UI/Button';
import Outlet from 'components/Outlet';

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
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { rgba } from 'polished';

// utils
import getCardSizes from './getCardSizes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
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

interface InputProps extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: 'dynamic' | 'threecolumns' | 'twocolumns';
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  windowSize: GetWindowSizeChildProps;
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

export type TCardSize = 'small' | 'medium' | 'large';

interface State {
  cardSizes: TCardSize[];
  areas: string[];
}

class ProjectAndFolderCards extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {
      cardSizes: [],
      areas: [],
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
      const cardSizes = getCardSizes(adminPublications, windowSize);

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

  render() {
    const { cardSizes, areas } = this.state;
    const { tenant, showTitle, layout, theme, adminPublications } = this.props;
    const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
    const hasPublications = list && list.length > 0;

    if (!isNilOrError(tenant)) {
      const customCurrentlyWorkingOn =
        tenant.attributes.settings.core.currently_working_on_text;

      return (
        <Container id="e2e-projects-container">
          <Header
            showTitle={showTitle}
            customCurrentlyWorkingOn={customCurrentlyWorkingOn}
            areas={areas}
            onAreasChange={this.handleAreasOnChange}
          />

          {loadingInitial && <LoadingBox />}

          {!loadingInitial && !hasPublications && <EmptyContainer />}

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
  injectIntl<Props>(withRouter(ProjectAndFolderCards))
);

const Data = adopt<DataProps, InputProps>({
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

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectAndFolderCardsWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
