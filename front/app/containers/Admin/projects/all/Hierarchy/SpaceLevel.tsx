import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useInfiniteProjectFoldersAdmin from 'api/project_folders_mini/useInfiniteProjectFoldersAdmin';
import useInfiniteProjectsMiniAdmin from 'api/projects_mini_admin/useInfiniteProjectsMiniAdmin';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import allMessages from '../messages';

import { PAGE_SIZE } from './constants';
import EmptyLevel from './EmptyLevel';
import FolderTiles from './Grid/FolderTiles';
import ProjectCards from './Grid/ProjectCards';
import LevelError from './LevelError';
import messages from './messages';
import Section from './Section';

interface Props {
  spaceId: string;
}

const SpaceLevel = ({ spaceId }: Props) => {
  const { formatMessage } = useIntl();
  const canListFolders = usePermission({
    item: 'project_folder',
    action: 'list_for_admin',
  });

  // With a space given, the top level is that space: its folders, and its
  // projects that aren't in one of them.
  const folders = useInfiniteProjectFoldersAdmin(
    { space_ids: [spaceId], top_level: true, sort: 'arranged' },
    PAGE_SIZE,
    { enabled: canListFolders }
  );
  const projects = useInfiniteProjectsMiniAdmin(
    { space_ids: [spaceId], top_level: true, sort: 'arranged' },
    PAGE_SIZE
  );

  if (folders.isLoading || projects.isLoading) return null;
  if (folders.isError || projects.isError) return <LevelError />;

  const foldersCount = folders.data?.pages[0].meta.total ?? 0;
  const projectsCount = projects.data?.pages[0].meta.total ?? 0;

  if (foldersCount + projectsCount === 0) return <EmptyLevel />;

  return (
    <Box>
      {foldersCount > 0 && (
        <Section
          label={formatMessage(allMessages.folders)}
          count={foldersCount}
        >
          <FolderTiles query={folders} />
        </Section>
      )}
      {projectsCount > 0 && (
        <Section
          label={formatMessage(
            foldersCount > 0
              ? messages.projectsNotInAFolder
              : allMessages.projects
          )}
          count={projectsCount}
        >
          <ProjectCards query={projects} />
        </Section>
      )}
    </Box>
  );
};

export default SpaceLevel;
