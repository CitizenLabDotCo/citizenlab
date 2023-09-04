import React from 'react';

// api
import usePhases from 'api/phases/usePhases';

// i18n
import useLocalize from 'hooks/useLocalize';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import { Box, Text, Select } from '@citizenlab/cl2-component-library';

// utils
import { canContainIdeas } from 'api/phases/utils';

// typings
import { IOption } from 'typings';

interface Props {
  phaseId?: string;
  projectId: string;
  onChange: (phaseId: string) => void;
}

const PhaseSelector = ({ projectId, phaseId, onChange }: Props) => {
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);
  const phasesThatCanContainIdeas = phases?.data.filter(canContainIdeas);

  if (!phasesThatCanContainIdeas) return null;
  if (phasesThatCanContainIdeas.length === 0) {
    return (
      <Box display="flex" alignItems="center">
        <Text color="error">
          <FormattedMessage {...messages.noPhasesInProject} />
        </Text>
      </Box>
    );
  }

  const options: IOption[] = phasesThatCanContainIdeas.map((phase) => ({
    value: phase.id,
    label: localize(phase.attributes.title_multiloc),
  }));

  const selectedPhaseCanContainIdeas = phasesThatCanContainIdeas
    .map((phase) => phase.id)
    .includes(phaseId);

  const handleChange = ({ value }: IOption) => {
    onChange(value);
  };

  return (
    <Box w="100%">
      <Box w="auto" minWidth="200px">
        <Select value={phaseId} options={options} onChange={handleChange} />
      </Box>
      {!selectedPhaseCanContainIdeas && (
        <Box display="flex" alignItems="center">
          <Text m="0" color="error">
            <FormattedMessage {...messages.selectAnotherPhase} />
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default PhaseSelector;
