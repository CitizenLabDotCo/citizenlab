import React, { useMemo, useEffect } from 'react';

// hooks
import usePhases from 'api/phases/usePhases';

// components
import { Box, Text, Select } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';
import { IPhaseData } from 'services/phases';
import { ParticipationMethod } from 'services/participationContexts';

interface Props {
  label: string;
  projectId: string;
  phaseId?: string;
  participationMethod: ParticipationMethod;
  onPhaseFilter: (filter: IOption) => void;
}

const isCorrectPhase =
  (participationMethod: ParticipationMethod) => (phase: IPhaseData) => {
    return phase.attributes.participation_method === participationMethod;
  };

const PhaseFilter = ({
  label,
  projectId,
  phaseId,
  participationMethod,
  onPhaseFilter,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  const localize = useLocalize();

  const correctPhases = useMemo(() => {
    return isNilOrError(phases)
      ? null
      : phases.data.filter(isCorrectPhase(participationMethod));
  }, [phases, participationMethod]);

  const phaseOptions = useMemo(() => {
    return correctPhases
      ? correctPhases.map(({ id, attributes }) => ({
          value: id,
          label: localize(attributes.title_multiloc),
        }))
      : null;
  }, [correctPhases, localize]);

  useEffect(() => {
    if (!phaseOptions || phaseOptions.length === 0) return;
    onPhaseFilter(phaseOptions[0]);
  }, [phaseOptions, onPhaseFilter]);

  if (!phaseOptions || phaseOptions.length === 0) return null;

  if (phaseOptions.length === 1) {
    return (
      <Box>
        <Text variant="bodyM" color="textSecondary">
          {phaseOptions[0].label}
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" mb="20px">
      <Select
        label={label}
        onChange={onPhaseFilter}
        value={phaseId}
        options={phaseOptions}
      />
    </Box>
  );
};

export default PhaseFilter;
