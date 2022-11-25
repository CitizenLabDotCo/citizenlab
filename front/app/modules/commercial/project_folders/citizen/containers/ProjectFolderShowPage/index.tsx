import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { userModeratesFolder } from '../../../permissions/roles';

// components
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';
import ProjectFolderHeader from './ProjectFolderHeader';
import ProjectFolderDescription from './ProjectFolderDescription';
import ProjectFolderProjectCards from './ProjectFolderProjectCards';
import Button from 'components/UI/Button';
import { Spinner, useWindowSize } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProjectFolder from '../../../hooks/useProjectFolder';
import useAdminPublications from 'hooks/useAdminPublications';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { maxPageWidth } from './styles';
import { media, fontSizes, colors } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from '../../../services/projectFolders';
import { PublicationStatus } from 'services/projects';

const Container = styled.main`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: #fff;

  ${media.tablet`
    background: ${colors.background};
  `}

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const Loading = styled.div`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 30px;
  background: #fff;

  @media (min-width: 1280px) {
    padding-left: 60px;
    padding-right: 60px;
  }
`;

const ButtonBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

const EditButton = styled(Button)`
  margin-left: 30px;
`;

const StyledProjectFolderHeader = styled(ProjectFolderHeader)`
  flex: 1;
  height: 240px;
  margin-bottom: 30px;

  ${media.phone`
    height: 140px;
  `};
`;

const Content = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 110px;

  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
  `};
`;

const StyledProjectFolderDescription = styled(ProjectFolderDescription)`
  flex: 1;

  ${media.tablet`
    margin-bottom: 40px;
  `};
`;

const StyledProjectFolderProjectCards = styled(ProjectFolderProjectCards)`
  flex: 0 1 800px;
  width: 800px;
  padding: 20px;
  padding-bottom: 0px;
  margin-left: 80px;
  margin-top: 4px;
  background: ${colors.background};
  border-radius: ${(props: any) => props.theme.borderRadius};

  &.oneCardPerRow {
    flex: 0 0 500px;
    width: 500px;
  }

  ${media.tablet`
    flex: 1;
    width: 100%;
    margin: 0;
    padding: 0;
    border-radius: 0;
  `};
`;

const NotFoundWrapper = styled.div`
  height: 100%;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
`;

const CardsWrapper = styled.div`
  padding-top: 40px;
  padding-bottom: 40px;
  background: ${colors.background};
`;

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const ProjectFolderShowPage = memo<{
  projectFolder: IProjectFolderData;
}>(({ projectFolder }) => {
  const authUser = useAuthUser();
  const locale = useLocale();
  const appConfig = useAppConfiguration();

  const { list: adminPublicationsList } = useAdminPublications({
    publicationStatusFilter: publicationStatuses,
  });
  const { windowWidth } = useWindowSize();
  const smallerThan1280px = windowWidth ? windowWidth <= 1280 : false;
  const folderNotFound = isError(projectFolder);

  const loading =
    isUndefined(locale) ||
    isUndefined(appConfig) ||
    isUndefined(projectFolder) ||
    isUndefined(adminPublicationsList);

  const userCanEditFolder =
    !isNilOrError(authUser) && userModeratesFolder(authUser, projectFolder.id);

  return (
    <>
      <ProjectFolderShowPageMeta projectFolder={projectFolder} />
      <Container id="e2e-folder-page">
        {folderNotFound ? (
          <NotFoundWrapper>
            <p>
              <FormattedMessage {...messages.noFolderFoundHere} />
            </p>
            <Button
              linkTo="/projects"
              text={<FormattedMessage {...messages.goBackToList} />}
              icon="arrow-left"
            />
          </NotFoundWrapper>
        ) : loading ? (
          <Loading>
            <Spinner />
          </Loading>
        ) : !isNilOrError(projectFolder) && !isNilOrError(locale) ? (
          <>
            {!smallerThan1280px ? (
              <StyledContentContainer maxWidth={maxPageWidth}>
                {userCanEditFolder && (
                  <ButtonBar>
                    <EditButton
                      icon="edit"
                      linkTo={`/admin/projects/folders/${projectFolder.id}/settings`}
                      buttonStyle="secondary"
                      padding="5px 8px"
                    >
                      <FormattedMessage {...messages.editFolder} />
                    </EditButton>
                  </ButtonBar>
                )}
                <StyledProjectFolderHeader projectFolder={projectFolder} />
                <Content>
                  <StyledProjectFolderDescription
                    projectFolder={projectFolder}
                  />
                  <StyledProjectFolderProjectCards
                    folderId={projectFolder.id}
                  />
                </Content>
              </StyledContentContainer>
            ) : (
              <>
                <StyledContentContainer maxWidth={maxPageWidth}>
                  <StyledProjectFolderHeader projectFolder={projectFolder} />
                  <StyledProjectFolderDescription
                    projectFolder={projectFolder}
                  />
                </StyledContentContainer>
                <CardsWrapper>
                  <ContentContainer maxWidth={maxPageWidth}>
                    <StyledProjectFolderProjectCards
                      folderId={projectFolder.id}
                    />
                  </ContentContainer>
                </CardsWrapper>
              </>
            )}
          </>
        ) : null}
      </Container>
    </>
  );
});

const ProjectFolderShowPageWrapper = memo<WithRouterProps>(
  ({ params: { slug } }) => {
    const projectFolder = useProjectFolder({ projectFolderSlug: slug });

    if (!isNilOrError(projectFolder)) {
      return <ProjectFolderShowPage projectFolder={projectFolder} />;
    }

    return null;
  }
);

export default withRouter(ProjectFolderShowPageWrapper);
