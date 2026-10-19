import React from 'react';

import GridView from './Grid/GridView';
import { LevelGroup } from './levelGroups';
import ListView from './List/ListView';
import useViewMode from './useViewMode';

interface Props {
  groups: LevelGroup[];
  // A count above the projects, in both views.
  summary?: string;
}

const LevelView = ({ groups, summary }: Props) => {
  const { viewMode } = useViewMode();

  return viewMode === 'list' ? (
    <ListView groups={groups} summary={summary} />
  ) : (
    <GridView groups={groups} summary={summary} />
  );
};

export default LevelView;
