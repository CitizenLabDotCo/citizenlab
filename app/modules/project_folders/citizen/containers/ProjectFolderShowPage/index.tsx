import React, { memo } from 'react';
import { isError, isUndefined } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';

// components
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';
import ProjectFolderHeader from './ProjectFolderHeader';
import ProjectFolderDescription from './ProjectFolderDescription';
import ProjectFolderProjectCards from './ProjectFolderProjectCards';
import Button from 'components/UI/Button';
import { Spinner } from 'cl2-component-library';
import ContentContainer from 'components/ContentContainer';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useProjectFolder from 'modules/project_folders/hooks/useProjectFolder';
import useAdminPublicationPrefetchProjects from 'hooks/useAdminPublicationPrefetchProjects';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { maxPageWidth } from './styles';
import { media, fontSizes, colors } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.main`
  flex: 1 0 auto;
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: #fff;

  ${media.smallerThan1100px`
    background: ${colors.background};
  `}

  ${media.smallerThanMaxTablet`
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

  @media (min-width: 1100px) {
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

  ${media.smallerThanMinTablet`
    height: 140px;
  `};
`;

const Content = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 110px;

  ${media.smallerThan1100px`
    flex-direction: column;
    align-items: stretch;
  `};
`;

const StyledProjectFolderDescription = styled(ProjectFolderDescription)`
  flex: 1;

  ${media.smallerThan1100px`
    margin-bottom: 40px;
  `};
`;

const StyledProjectFolderProjectCards = styled(ProjectFolderProjectCards)`
  flex: 0 0 800px;
  width: 800px;
  padding: 25px;
  padding-bottom: 5px;
  margin-left: 80px;
  margin-top: 4px;
  background: ${colors.background};
  border-radius: ${(props: any) => props.theme.borderRadius};

  &.oneCardPerRow {
    flex: 0 0 500px;
    width: 500px;
  }

  ${media.smallerThan1100px`
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
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

const CardsWrapper = styled.div`
  padding-top: 40px;
  padding-bottom: 40px;
  background: ${colors.background};
`;

const ProjectFolderShowPage = memo<{
  projectFolder: IProjectFolderData;
}>(({ projectFolder }) => {
  const authUser = useAuthUser();
  const locale = useLocale();
  const tenant = useAppConfiguration();
  const adminPublication = useAdminPublicationPrefetchProjects({
    folderId: projectFolder.id,
    publicationStatusFilter: ['published', 'archived'],
  });
  const { windowWidth } = useWindowSize();

  const smallerThan1100px = windowWidth ? windowWidth <= 1100 : false;
  const folderNotFound = isError(projectFolder);
  const loading =
    isUndefined(locale) ||
    isUndefined(tenant) ||
    isUndefined(projectFolder) ||
    isUndefined(adminPublication?.list);

  const userCanEditProject =
    !isNilOrError(authUser) && isAdmin({ data: authUser });

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
              icon="arrow-back"
            />
          </NotFoundWrapper>
        ) : loading ? (
          <Loading>
            <Spinner />
          </Loading>
        ) : !isNilOrError(projectFolder) && !isNilOrError(locale) ? (
          <>
            {!smallerThan1100px ? (
              <StyledContentContainer maxWidth={maxPageWidth}>
                {userCanEditProject && (
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
                    list={adminPublication.list}
                    className={
                      adminPublication.list?.filter(
                        (item) => item.publicationType === 'project'
                      )?.length === 1 ||
                      (windowWidth > 1000 && windowWidth < 1350)
                        ? 'oneCardPerRow'
                        : ''
                    }
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
                      list={adminPublication.list}
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
