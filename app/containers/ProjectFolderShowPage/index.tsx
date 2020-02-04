import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isError, isUndefined } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// components
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';
import Header from './Header';
import Button from 'components/UI/Button';
import Spinner from 'components/UI/Spinner';
import ProjectCards from 'components/ProjectCards';
import ProjectFolderInfo from './ProjectFolderInfo';
import ContentContainer from 'components/ContentContainer';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
    background: ${colors.background};
  `}

  ${media.biggerThanMinTablet`
    &.loaded {
      min-height: 900px;
    }
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ProjectNotFoundWrapper = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

export interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  projectFolder: GetProjectFolderChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  hasEvents: boolean;
  loaded: boolean;
}

class ProjectsShowPage extends PureComponent<Props & WithRouterProps, State> {
  render() {
    const { locale, tenant, projectFolder } = this.props;
    const { slug } = this.props.params;
    const projectNotFound = isError(projectFolder);
    const loading = (isUndefined(locale) || isUndefined(tenant) || isUndefined(projectFolder));

    return (
      <>
        <ProjectFolderShowPageMeta projectSlug={slug} />
        <Container className={`${!loading ? 'loaded' : 'loading'}`}>
          {projectNotFound ? (
            <ProjectNotFoundWrapper>
              <p><FormattedMessage {...messages.noProjectFoundHere} /></p>
              <Button
                linkTo="/projects"
                text={<FormattedMessage {...messages.goBackToList} />}
                icon="arrow-back"
              />
            </ProjectNotFoundWrapper>
          ) : (
              loading ? (
                <Loading>
                  <Spinner />
                </Loading>
              ) : (
                !isNilOrError(projectFolder) ? (
                  <>
                    {/* <Header projectSlug={this.props.params.slug} /> */}
                    <Content>
                      <ContentContainer>
                        <ProjectFolderInfo projectFolderId={projectFolder.id} />
                        <ProjectCards
                          pageSize={50}
                          publicationStatuses={['published', 'archived']}
                          sort="new"
                          showTitle={false}
                          showPublicationStatusFilter={true}
                          layout="threecolumns"
                          folderId={projectFolder.id}
                        />
                      </ContentContainer>
                    </Content>
                  </>
                ) : null
              )
            )}
        </Container>
      </>
    );
  }
}

// TODO: add vertical padding to ContentContainer

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderSlug={params.slug}>{render}</GetProjectFolder>,
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ProjectsShowPage {...inputProps} {...dataProps} />}
  </Data>
));
