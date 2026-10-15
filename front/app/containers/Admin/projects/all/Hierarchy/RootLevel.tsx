import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import EmptyLevel from './EmptyLevel';
import FolderTiles from './Grid/FolderTiles';
import ProjectCards from './Grid/ProjectCards';
import SpaceTile from './Grid/SpaceTile';
import TileGrid from './Grid/TileGrid';
import { getRootLabels } from './rootLabels';
import Section from './Section';
import { RootContents } from './useRootContents';

interface Props {
  contents: RootContents;
}

const RootLevel = ({ contents }: Props) => {
  const { formatMessage } = useIntl();
  const seesAll = usePermission({
    item: 'project',
    action: 'list_all_for_admin',
  });

  const spaces = contents.spaces.data?.data ?? [];
  const foldersCount = contents.folders.data?.pages[0].meta.total ?? 0;
  const projectsCount = contents.projects.data?.pages[0].meta.total ?? 0;

  if (spaces.length + foldersCount + projectsCount === 0) {
    return <EmptyLevel />;
  }

  const labels = getRootLabels({
    seesAll,
    hasContainers: spaces.length + foldersCount > 0,
  });

  return (
    <Box>
      {spaces.length > 0 && (
        <Section
          label={formatMessage(labels.spaces, { count: spaces.length })}
          count={spaces.length}
        >
          <TileGrid>
            {spaces.map((space) => (
              <SpaceTile key={space.id} space={space} />
            ))}
          </TileGrid>
        </Section>
      )}
      {foldersCount > 0 && (
        <Section label={formatMessage(labels.folders)} count={foldersCount}>
          <FolderTiles query={contents.folders} />
        </Section>
      )}
      {projectsCount > 0 && (
        <Section label={formatMessage(labels.projects)} count={projectsCount}>
          <ProjectCards query={contents.projects} showPath />
        </Section>
      )}
    </Box>
  );
};

export default RootLevel;
