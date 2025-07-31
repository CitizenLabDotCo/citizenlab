import React, { useState } from 'react';

import { Box, colors, Icon } from '@citizenlab/cl2-component-library';

import { FilterKey } from './constants';
import Discoverability from './Filters/Discoverability';
import Folders from './Filters/Folders';
import Manager from './Filters/Manager';
import ParticipationMethods from './Filters/ParticipationMethods';
import ParticipationStates from './Filters/ParticipationStates';
import Status from './Filters/Status';
import Visibility from './Filters/Visibility';

interface Props {
  filterKey: FilterKey;
  onRemove: (filterKey: FilterKey) => void;
}

const ActiveFilter = ({ filterKey, onRemove }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      p="4px 12px"
      border="1px solid"
      borderColor={colors.grey700}
      borderRadius="3px"
      background="white"
      py="10px"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box flex="1">
        <Filter filterKey={filterKey} />
      </Box>

      {isHovered && (
        <Box
          as="button"
          type="button"
          borderRadius="50%"
          width="20px"
          height="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="grey100"
          border="1px solid"
          borderColor={colors.grey700}
          cursor="pointer"
          onClick={() => onRemove(filterKey)}
          aria-label="Remove filter"
          p="2px"
        >
          <Icon name="close" />
        </Box>
      )}
    </Box>
  );
};

const Filter = ({ filterKey }: { filterKey: FilterKey }) => {
  switch (filterKey) {
    case 'status':
      return <Status />;
    case 'managers':
      return <Manager />;
    case 'folder_ids':
      return <Folders />;
    case 'participation_states':
      return <ParticipationStates />;
    case 'participation_methods':
      return <ParticipationMethods />;
    case 'visibility':
      return <Visibility />;
    case 'discoverability':
      return <Discoverability />;
  }
};

export default ActiveFilter;
