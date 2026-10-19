import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FolderLevelActions from './FolderLevelActions';
import LevelBreadcrumbs from './LevelBreadcrumbs';
import SpaceLevelActions from './SpaceLevelActions';
import { SubLevel } from './useLevelDetails';

interface Props {
  level: SubLevel;
  showRoot: boolean;
}

// A space's or folder's name with the way back up, then who manages it and
// its "⋯".
const LevelHeader = ({ level, showRoot }: Props) => (
  <Box display="flex" alignItems="center" gap="12px" minWidth="0">
    <LevelBreadcrumbs level={level} showRoot={showRoot} />
    {level.kind === 'space' ? (
      <SpaceLevelActions spaceId={level.id} />
    ) : (
      <FolderLevelActions folderId={level.id} />
    )}
  </Box>
);

export default LevelHeader;
