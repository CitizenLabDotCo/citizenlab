import React, { useMemo } from 'react';

import { Box, Select, Spinner, Text } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  id?: string;
  label: string;
  projectId: string;
  phaseId?: string;
  participationMethods: ParticipationMethod[];
  onPhaseFilter: (filter: IOption) => void;
  customPhaseFilter?: (phases: IPhaseData[]) => IPhaseData[];
}

const isCorrectPhase =
  (participationMethods: ParticipationMethod[]) => (phase: IPhaseData) => {
    return participationMethods.includes(phase.attributes.participation_method);
  };

const PhaseFilter = ({
  id,
  label,
  projectId,
  phaseId,
  participationMethods,
  onPhaseFilter,
  customPhaseFilter,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  const localize = useLocalize();
  const correctPhases = useMemo(() => {
    if (!phases) return null;

    let filteredPhases = phases.data.filter(
      isCorrectPhase(participationMethods)
    );

    // Apply custom filter if provided
    if (customPhaseFilter) {
      filteredPhases = customPhaseFilter(filteredPhases);
    }

    return filteredPhases;
  }, [phases, participationMethods, customPhaseFilter]);

  const phaseOptions = useMemo(() => {
    return correctPhases
      ? correctPhases.map(({ id, attributes }) => ({
          value: id,
          label: localize(attributes.title_multiloc),
        }))
      : null;
  }, [correctPhases, localize]);

  if (!phaseOptions) {
    return (
      <Box mb="20px">
        <Spinner />
      </Box>
    );
  }

  if (phaseOptions.length === 0) {
    return (
      <Box mb="20px">
        <Text color="red600">
          <FormattedMessage {...messages.noAppropriatePhases} />
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" mb="20px">
      <Select
        id={id || 'e2e-phase-filter'}
        label={label}
        onChange={onPhaseFilter}
        value={phaseId}
        options={phaseOptions}
      />
    </Box>
  );
};

export default PhaseFilter;
