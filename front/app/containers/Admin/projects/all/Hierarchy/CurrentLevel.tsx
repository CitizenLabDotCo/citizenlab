import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useSearch } from 'utils/router';

import FolderLevel from './FolderLevel';
import { getLevel, Level } from './level';
import LevelBreadcrumbs from './LevelBreadcrumbs';
import RootLevel from './RootLevel';
import RootSummary from './RootSummary';
import SpaceLevel from './SpaceLevel';
import { RootContents } from './useRootContents';

interface Props {
  landing: Level;
  contents: RootContents;
}

// The level in the URL, or where this user lands without one.
const CurrentLevel = ({ landing, contents }: Props) => {
  const search = useSearch({ from: '/$locale/admin/projects/' });
  const level = getLevel(search, landing);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        minHeight="36px"
        mt="32px"
        mb="20px"
      >
        {level.kind === 'root' ? (
          <RootSummary contents={contents} />
        ) : (
          <LevelBreadcrumbs level={level} showRoot={landing.kind === 'root'} />
        )}
      </Box>
      {level.kind === 'root' && <RootLevel contents={contents} />}
      {level.kind === 'space' && (
        <SpaceLevel key={level.id} spaceId={level.id} />
      )}
      {level.kind === 'folder' && (
        <FolderLevel key={level.id} folderId={level.id} />
      )}
    </>
  );
};

export default CurrentLevel;
