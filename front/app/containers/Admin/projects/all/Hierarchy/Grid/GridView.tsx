import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { LevelGroup } from '../levelGroups';
import Section from '../Section';

import FolderTiles from './FolderTiles';
import ProjectCards from './ProjectCards';
import SpaceTile from './SpaceTile';
import TileGrid from './TileGrid';

interface Props {
  groups: LevelGroup[];
}

const GridView = ({ groups }: Props) => (
  <Box>
    {groups.map((group) => (
      <Section key={group.kind} label={group.label} count={group.count}>
        {group.kind === 'spaces' && (
          <TileGrid>
            {group.spaces.data.map((space) => (
              <SpaceTile key={space.id} space={space} />
            ))}
          </TileGrid>
        )}
        {group.kind === 'folders' && <FolderTiles query={group.query} />}
        {group.kind === 'projects' && (
          <ProjectCards query={group.query} showPath={group.showPath} />
        )}
      </Section>
    ))}
  </Box>
);

export default GridView;
