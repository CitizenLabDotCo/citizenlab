import React from 'react';
import { IPhaseData } from 'services/phases';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarPhasesItem from './FilterSidebarPhasesItem';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phases?: IPhaseData[];
  selectedPhase?: string | null;
  onChangePhaseFilter?: (phaseId: string) => void;
}

const FilterSidebarPhases = ({
  phases,
  selectedPhase,
  onChangePhaseFilter,
}: Props) => {
  const handleItemClick = (id: string) => () => {
    onChangePhaseFilter && onChangePhaseFilter(id);
  };

  const clearFilter = () => {
    onChangePhaseFilter && onChangePhaseFilter(null);
  };

  const isActive = (id: string) => {
    return selectedPhase === id;
  };

  return (
    <Menu secondary vertical fluid>
      <Menu.Item onClick={clearFilter} active={!selectedPhase}>
        <FormattedMessage {...messages.allPhases} />
      </Menu.Item>
      <Divider />
      {phases &&
        phases.map((phase, index) => (
          <FilterSidebarPhasesItem
            key={phase.id}
            phase={phase}
            phaseNumber={index + 1}
            active={isActive(phase.id)}
            onClick={handleItemClick(phase.id)}
          />
        ))}
    </Menu>
  );
};

export default FilterSidebarPhases;
