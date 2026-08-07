import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IProjectFolderData } from 'api/project_folders/types';
import useProjectFolderBySlug from 'api/project_folders/useProjectFolderBySlug';

import ContentContainer from 'components/ContentContainer';
import FolderContentViewer from 'components/DescriptionBuilder/ContentViewer/FolderContentViewer';
import FollowUnfollow from 'components/FollowUnfollow';
import PageNotFound from 'components/PageNotFound';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { FormattedMessage } from 'utils/cl-intl';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';
import { useParams } from 'utils/router';

import messages from './messages';
import ProjectFolderHeader from './ProjectFolderHeader';
import ProjectFolderShowPageMeta from './ProjectFolderShowPageMeta';

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 30px;
  background: #fff;
  @media (min-width: 1166px) {
    padding-left: 60px;
    padding-right: 60px;
  }
`;

interface Props {
  projectFolder: IProjectFolderData;
}

const ProjectFolderShowPage = ({ projectFolder }: Props) => {
  const { data: authUser } = useAuthUser();

  const userCanEditFolder = userModeratesFolder(authUser, projectFolder.id);
  const maxPageWidth = '1166px';

  return (
    <main id="e2e-folder-page">
      <StyledContentContainer maxWidth={maxPageWidth}>
        <Box display="flex" width="100%">
          <Box ml="auto" display="flex">
            {userCanEditFolder && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                ml="30px"
              >
                <ButtonWithLink
                  icon="edit"
                  to="/admin/projects/folders/$projectFolderId/settings"
                  params={{ projectFolderId: projectFolder.id }}
                  buttonStyle="secondary-outlined"
                  padding="6px 12px"
                >
                  <FormattedMessage {...messages.editFolder} />
                </ButtonWithLink>
              </Box>
            )}
            <Box ml="8px">
              <FollowUnfollow
                followableType="project_folders"
                followableId={projectFolder.id}
                followersCount={projectFolder.attributes.followers_count}
                followerId={projectFolder.relationships.user_follower?.data?.id}
                followableSlug={projectFolder.attributes.slug}
                w="auto"
                py="6px"
                iconSize="20px"
                toolTipType="projectOrFolder"
              />
            </Box>
          </Box>
        </Box>
      </StyledContentContainer>
      <Box>
        <StyledContentContainer maxWidth={maxPageWidth}>
          <ProjectFolderHeader projectFolder={projectFolder} />
          <FolderContentViewer
            folderId={projectFolder.id}
            folderTitle={projectFolder.attributes.title_multiloc}
          />
        </StyledContentContainer>
      </Box>
    </main>
  );
};

const ProjectFolderShowPageWrapper = () => {
  const { slug } = useParams({ from: '/$locale/folders/$slug' });
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
      <ProjectFolderShowPage projectFolder={projectFolder.data} />
    </>
  );
};

export default ProjectFolderShowPageWrapper;
