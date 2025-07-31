import React from 'react';

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
  onRemove: () => void;
}

const ActiveFilter = ({ filterKey, onRemove }: Props) => {
  switch (filterKey) {
    case 'status':
      return <Status onClear={onRemove} />;
    case 'managers':
      return <Manager onClear={onRemove} />;
    case 'folder_ids':
      return <Folders onClear={onRemove} />;
    case 'participation_states':
      return <ParticipationStates onClear={onRemove} />;
    case 'participation_methods':
      return <ParticipationMethods onClear={onRemove} />;
    case 'visibility':
      return <Visibility onClear={onRemove} />;
    case 'discoverability':
      return <Discoverability onClear={onRemove} />;
  }
};

export default ActiveFilter;
