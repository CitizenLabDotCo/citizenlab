import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import FilterRadioButton from './FilterRadioButton';

type Props = {
  phases: IPhaseData[];
  selectedPhase: string | undefined;
  onChangePhaseFilter: (phase: string | null) => void;
};

const LabelContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      height="24px"
    >
      {children}
    </Box>
  );
};

const FilterSidebarPhases = ({
  phases,
  selectedPhase,
  onChangePhaseFilter,
}: Props) => {
  const localize = useLocalize();

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
    <Box display="flex" flexDirection="column">
      <FilterRadioButton
        isSelected={!selectedPhase}
        onChange={clearFilter}
        labelContent={
          <LabelContentWrapper>
            <FormattedMessage {...messages.allPhases} />
          </LabelContentWrapper>
        }
      />
      <Box
        width="100%"
        as="hr"
        border={`1px solid ${colors.background}`}
        mb="8px"
      />
      {phases.map((phase, phaseIndex) => (
        <FilterRadioButton
          key={phase.id}
          isSelected={isActive(phase.id)}
          onChange={handleItemClick(phase.id)}
          phase={phase}
          labelContent={
            <LabelContentWrapper>
              {localize(phase.attributes.title_multiloc)}
              <Box
                width="24px"
                height="24px"
                border={`1px solid ${colors.teal}`}
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                background={colors.white}
              >
                {phaseIndex + 1}
              </Box>
            </LabelContentWrapper>
          }
        />
      ))}
    </Box>
  );
};

export default FilterSidebarPhases;
