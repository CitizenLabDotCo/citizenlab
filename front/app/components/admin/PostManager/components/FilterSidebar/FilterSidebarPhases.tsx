import React from 'react';

import { Divider, Menu } from 'semantic-ui-react';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import FilterSidebarPhasesItem from './FilterSidebarPhasesItem';

type Props = {
  phases: IPhaseData[];
  selectedPhase: string | undefined;
  onChangePhaseFilter: (phase: string | null) => void;
};

const FilterSidebarPhases = ({
  phases,
  selectedPhase,
  onChangePhaseFilter,
}: Props) => {
  const handleItemClick = (phaseId: string) => () => {
    onChangePhaseFilter(phaseId);
  };

  const clearFilter = () => {
    onChangePhaseFilter(null);
  };

  const isActive = (id: string) => {
    return selectedPhase === id;
  };

  return (
    <Menu
      secondary={true}
      vertical={true}
      fluid={true}
      className="intercom-admin-input-manager-phases"
    >
      <Menu.Item onClick={clearFilter} active={!selectedPhase}>
        <FormattedMessage {...messages.allPhases} />
      </Menu.Item>
      <Divider />
      {phases.map((phase, index) => (
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
