import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FilterMenu from './Filters/FilterMenu';
import { Level } from './level';
import SearchToggle from './SearchToggle';
import ViewModeSwitch from './ViewModeSwitch';

interface Props {
  level: Level;
}

const Toolbar = ({ level }: Props) => (
  <Box display="flex" alignItems="center" gap="6px" flex="none" ml="auto">
    {/* Opening a level clears the search, so each level gets a fresh field:
    a search still being typed on the last one is dropped with it. */}
    <SearchToggle key={level.kind === 'root' ? 'root' : level.id} />
    <FilterMenu level={level} />
    <ViewModeSwitch />
  </Box>
);

export default Toolbar;
