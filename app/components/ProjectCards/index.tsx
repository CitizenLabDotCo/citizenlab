import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ProjectCard from 'components/ProjectCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';
import SelectAreas from './SelectAreas';

// resources
import GetProjects, { GetProjectsChildProps, InputProps as GetProjectsInputProps } from 'resources/GetProjects';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

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
  border: solid 1px ${colors.separation};
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    justify-content: flex-start;
  `};
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  color: ${(props: any) => props.theme.colorText};
  margin-bottom: 0;
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
  border: solid 1px ${colors.separation};
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
  font-size: ${fontSizes.large}px;
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

interface DataProps {
  projects: GetProjectsChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
}

interface InputProps extends GetProjectsInputProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectCards extends PureComponent<Props & InjectedIntlProps, State> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {};
  }

  loadMore = () => {
    this.props.projects.onLoadMore();
  }

  handleAreasOnChange = (areas: string[]) => {
    this.props.projects.onChangeAreas(areas);
  }

  render() {
    const { tenant, locale } = this.props;
    const { queryParameters, projectsList, hasMore, querying, loadingMore } = this.props.projects;
    const hasProjects = (projectsList && projectsList.length > 0);
    const selectedAreas = (queryParameters.areas || this.emptyArray);

    if (!isNilOrError(tenant) && locale) {
      const organizationNameMulitiLoc = tenant.attributes.settings.core.organization_name;
      const tenantLocales = tenant.attributes.settings.core.locales;
      const tenantName = getLocalized(organizationNameMulitiLoc, locale, tenantLocales);

      return (
        <Container id="e2e-projects-container">
          <Header>
            <Title>
              {this.props.intl.formatMessage(messages.currentlyWorkingOn, { tenantName })}
            </Title>

            <FilterArea>
              <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
            </FilterArea>
          </Header>

          {querying &&
            <Loading id="projects-loading">
              <Spinner />
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

          {!querying && hasProjects && projectsList &&
            <ProjectsList id="e2e-projects-list">
              {projectsList.map((project) => (
                <StyledProjectCard key={project.id} projectId={project.id} />
              ))}
            </ProjectsList>
          }

          {!querying && hasMore &&
            <LoadMoreButtonWrapper>
              <LoadMoreButton
                onClick={this.loadMore}
                size="2"
                style="secondary"
                text={<FormattedMessage {...messages.loadMore} />}
                processing={loadingMore}
                fullWidth={true}
                height="58px"
              />
            </LoadMoreButtonWrapper>
          }
        </Container>
      );
    }

    return null;
  }
}

const ProjectCardsWithHOCs = injectIntl(ProjectCards);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  locale: <GetLocale />,
  projects: ({ render, ...getProjectsInputProps }) => <GetProjects {...getProjectsInputProps}>{render}</GetProjects>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectCardsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
