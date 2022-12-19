import React from 'react';

// hooks
import usePhases from 'hooks/usePhases';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Select } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';
import { IPhaseData } from 'services/phases';

interface Props {
  projectId: string;
  phaseId?: string;
  onPhaseFilter: (filter: IOption) => void;
}

const isNativeSurveyPhase = (phase: IPhaseData) => {
  return phase.attributes.participation_method === 'native_survey';
};

const PhaseFilter = ({ projectId, phaseId, onPhaseFilter }: Props) => {
  const phases = usePhases(projectId);
  const localize = useLocalize();

  if (isNilOrError(phases)) {
    return null;
  }

  const surveyPhases = phases.filter(isNativeSurveyPhase);
  const phaseOptions = surveyPhases.map(({ id, attributes }) => ({
    value: id,
    label: localize(attributes.title_multiloc),
  }));

  if (phaseOptions.length === 0) return null;

  if (phaseOptions.length === 1) {
    return (
      <Box>
        <Text variant="bodyM" color="textSecondary">
          Showing questions for:{' '}
          {localize(surveyPhases[0].attributes.title_multiloc)}
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" mb="20px">
      <Select
        label="Survey Phases"
        onChange={onPhaseFilter}
        value={phaseId}
        options={phaseOptions}
      />
    </Box>
  );
};

export default PhaseFilter;
