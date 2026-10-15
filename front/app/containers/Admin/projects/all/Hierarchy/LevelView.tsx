import React from 'react';

import GridView from './Grid/GridView';
import { LevelGroup } from './levelGroups';
import ListView from './List/ListView';
import useViewMode from './useViewMode';

interface Props {
  groups: LevelGroup[];
}

const LevelView = ({ groups }: Props) => {
  const { viewMode } = useViewMode();

  return viewMode === 'list' ? (
    <ListView groups={groups} />
  ) : (
    <GridView groups={groups} />
  );
};

export default LevelView;
