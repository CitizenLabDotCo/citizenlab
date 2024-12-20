import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

import FilterRadioButton from '../FilterRadioButton';
import LabelContentWrapper from '../FilterRadioButton/LabelContentWrapper';
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

  const name = 'phase';

  return (
    <Box display="flex" flexDirection="column">
      {/* FilterRadioButton is also used inside FilterSidebarPhasesItem */}
      <FilterRadioButton
        id="all-phases"
        isSelected={!selectedPhase}
        onChange={clearFilter}
        labelContent={
          <LabelContentWrapper>
            <FormattedMessage {...messages.allPhases} />
          </LabelContentWrapper>
        }
        name={name}
      />
      <Box
        width="100%"
        as="hr"
        border={`1px solid ${colors.background}`}
        mb="8px"
      />
      {phases.map((phase, phaseIndex) => (
        <FilterSidebarPhasesItem
          id={phase.id}
          key={phase.id}
          isSelected={isActive(phase.id)}
          onChange={handleItemClick(phase.id)}
          phase={phase}
          phaseNumber={phaseIndex + 1}
          name={name}
        />
      ))}
    </Box>
  );
};

export default FilterSidebarPhases;
