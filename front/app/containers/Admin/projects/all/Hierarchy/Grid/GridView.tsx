import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { LevelGroup } from '../levelGroups';
import LevelSummary from '../LevelSummary';
import Section from '../Section';

import FolderTiles from './FolderTiles';
import ProjectCards from './ProjectCards';
import SpaceTiles from './SpaceTiles';

interface Props {
  groups: LevelGroup[];
  summary?: string;
}

const GridView = ({ groups, summary }: Props) => (
  <Box data-cy="projects-hierarchy-grid">
    {summary && <LevelSummary text={summary} />}
    {groups.map((group) => (
      <Section key={group.kind} label={group.label} count={group.count}>
        {group.kind === 'spaces' && (
          <SpaceTiles spaces={group.spaces} arrangeable={group.arrangeable} />
        )}
        {group.kind === 'folders' && (
          <FolderTiles query={group.query} arrangeable={group.arrangeable} />
        )}
        {group.kind === 'projects' && (
          <ProjectCards
            query={group.query}
            pathFrom={group.pathFrom}
            arrangeable={group.arrangeable}
          />
        )}
      </Section>
    ))}
  </Box>
);

export default GridView;
