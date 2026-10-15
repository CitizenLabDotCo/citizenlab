import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useSearch } from 'utils/router';

import FilterChips from './Filters/FilterChips';
import useFilters from './Filters/useFilters';
import FolderLevel from './FolderLevel';
import { getLevel, Level } from './level';
import LevelBreadcrumbs from './LevelBreadcrumbs';
import NarrowedLevel from './NarrowedLevel';
import RootLevel from './RootLevel';
import RootSummary from './RootSummary';
import SpaceLevel from './SpaceLevel';
import Toolbar from './Toolbar';
import { RootContents } from './useRootContents';

interface Props {
  landing: Level;
  contents: RootContents;
}

// The level in the URL, or where this user lands without one.
const CurrentLevel = ({ landing, contents }: Props) => {
  const search = useSearch({ from: '/$locale/admin/projects/' });
  const level = getLevel(search, landing);
  const { isNarrowed } = useFilters(level);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap="16px"
        minHeight="36px"
        mt="32px"
        mb="20px"
      >
        {level.kind === 'root' ? (
          // What the top level holds doesn't describe a search's results.
          !isNarrowed && <RootSummary contents={contents} />
        ) : (
          <LevelBreadcrumbs level={level} showRoot={landing.kind === 'root'} />
        )}
        <Toolbar level={level} />
      </Box>
      <FilterChips level={level} />
      {isNarrowed && <NarrowedLevel level={level} />}
      {!isNarrowed && level.kind === 'root' && (
        <RootLevel contents={contents} />
      )}
      {!isNarrowed && level.kind === 'space' && (
        <SpaceLevel key={level.id} spaceId={level.id} />
      )}
      {!isNarrowed && level.kind === 'folder' && (
        <FolderLevel key={level.id} folderId={level.id} />
      )}
    </>
  );
};

export default CurrentLevel;
