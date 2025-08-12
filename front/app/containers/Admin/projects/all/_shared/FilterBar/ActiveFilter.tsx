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
  shouldOpenByDefault?: boolean;
  onOpened?: () => void;
}

const ActiveFilter = ({
  filterKey,
  onRemove,
  shouldOpenByDefault,
  onOpened,
}: Props) => {
  switch (filterKey) {
    case 'status':
      return (
        <Status
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'managers':
      return (
        <Manager
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'folder_ids':
      return (
        <Folders
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'participation_states':
      return (
        <ParticipationStates
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'participation_methods':
      return (
        <ParticipationMethods
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'visibility':
      return (
        <Visibility
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
    case 'discoverability':
      return (
        <Discoverability
          onClear={onRemove}
          shouldOpenByDefault={shouldOpenByDefault}
          onOpened={onOpened}
        />
      );
  }
};

export default ActiveFilter;
