import React, { useMemo } from 'react';

// hooks
import usePhases from 'api/phases/usePhases';

// components
import { Box, Select, Text } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';

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
    return phases
      ? phases.data.filter(isCorrectPhase(participationMethod))
      : null;
  }, [phases, participationMethod]);

  const phaseOptions = useMemo(() => {
    return correctPhases
      ? correctPhases.map(({ id, attributes }) => ({
          value: id,
          label: localize(attributes.title_multiloc),
        }))
      : null;
  }, [correctPhases, localize]);

  if (!phaseOptions || phaseOptions.length === 0) {
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
        label={label}
        onChange={onPhaseFilter}
        value={phaseId}
        options={phaseOptions}
      />
    </Box>
  );
};

export default PhaseFilter;
