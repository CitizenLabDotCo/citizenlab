import React, { memo } from 'react';

// components
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';
import ProjectFolderHeader from './ProjectFolderHeader';
import ProjectFolderDescription from './ProjectFolderDescription';
import ProjectFolderProjectCards from './ProjectFolderProjectCards';
import Button from 'components/UI/Button';
import PageNotFound from 'components/PageNotFound';
import {
  Box,
  Spinner,
  useWindowSize,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import FollowUnfollow from 'components/FollowUnfollow';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useProjectFolderBySlug from 'api/project_folders/useProjectFolderBySlug';
import { useParams } from 'react-router-dom';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { maxPageWidth } from './styles';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';

// typings
import { IProjectFolderData } from 'api/project_folders/types';
import { isUnauthorizedRQ } from 'utils/errorUtils';

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

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 30px;
  background: #fff;

  @media (min-width: 1280px) {
    padding-left: 60px;
    padding-right: 60px;
  }
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
  border-radius: ${(props) => props.theme.borderRadius};

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

const CardsWrapper = styled.div`
  padding-top: 40px;
  padding-bottom: 40px;
  background: ${colors.background};
`;

const ProjectFolderShowPage = memo<{
  projectFolder: IProjectFolderData;
}>(({ projectFolder }) => {
  const { data: authUser } = useAuthUser();
  const { windowWidth } = useWindowSize();
  const smallerThan1280px = windowWidth ? windowWidth <= 1280 : false;

  const userCanEditFolder =
    !isNilOrError(authUser) &&
    userModeratesFolder(authUser.data, projectFolder.id);

  return (
    <Container id="e2e-folder-page">
      <>
        <StyledContentContainer maxWidth={maxPageWidth}>
          <Box display="flex" width="100%">
            <Box ml="auto" display="flex" mb="24px">
              {userCanEditFolder && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  ml="30px"
                >
                  <Button
                    icon="edit"
                    linkTo={`/admin/projects/folders/${projectFolder.id}/settings`}
                    buttonStyle="secondary"
                    padding="6px 12px"
                  >
                    <FormattedMessage {...messages.editFolder} />
                  </Button>
                </Box>
              )}
              <Box ml="8px">
                <FollowUnfollow
                  followableType="project_folders"
                  followableId={projectFolder.id}
                  followersCount={projectFolder.attributes.followers_count}
                  followerId={
                    projectFolder.relationships.user_follower?.data?.id
                  }
                  followableSlug={projectFolder.attributes.slug}
                  w="auto"
                  py="6px"
                  iconSize="20px"
                />
              </Box>
            </Box>
          </Box>
          <ProjectFolderHeader projectFolder={projectFolder} />
          {!smallerThan1280px ? (
            <Content>
              <StyledProjectFolderDescription projectFolder={projectFolder} />
              <StyledProjectFolderProjectCards folderId={projectFolder.id} />
            </Content>
          ) : (
            <StyledProjectFolderDescription projectFolder={projectFolder} />
          )}
        </StyledContentContainer>

        {smallerThan1280px && (
          <CardsWrapper>
            <ContentContainer maxWidth={maxPageWidth}>
              <StyledProjectFolderProjectCards folderId={projectFolder.id} />
            </ContentContainer>
          </CardsWrapper>
        )}
      </>
    </Container>
  );
});

const ProjectFolderShowPageWrapper = () => {
  const { slug } = useParams();
  const { data: projectFolder, status, error } = useProjectFolderBySlug(slug);

  if (status === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  return (
    <>
      <ProjectFolderShowPageMeta projectFolder={projectFolder.data} />
      <ProjectFolderShowPage projectFolder={projectFolder.data} />;
    </>
  );
};

export default ProjectFolderShowPageWrapper;
