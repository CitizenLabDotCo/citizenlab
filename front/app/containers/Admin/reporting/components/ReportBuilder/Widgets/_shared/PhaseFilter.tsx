import React, { useMemo, useEffect } from 'react';

// hooks
import usePhases from 'hooks/usePhases';

// components
import { Box, Text, Select } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IOption } from 'typings';
import { IPhaseData } from 'services/phases';

interface Props {
  label: string;
  projectId: string;
  phaseId?: string;
  onPhaseFilter: (filter: IOption) => void;
}

const isNativeSurveyPhase = (phase: IPhaseData) => {
  return phase.attributes.participation_method === 'native_survey';
};

const PhaseFilter = ({ label, projectId, phaseId, onPhaseFilter }: Props) => {
  const phases = usePhases(projectId);
  const localize = useLocalize();

  const surveyPhases = useMemo(() => {
    return isNilOrError(phases) ? null : phases.filter(isNativeSurveyPhase);
  }, [phases]);

  const phaseOptions = useMemo(() => {
    return surveyPhases
      ? surveyPhases.map(({ id, attributes }) => ({
          value: id,
          label: localize(attributes.title_multiloc),
        }))
      : null;
  }, [surveyPhases, localize]);

  useEffect(() => {
    if (!phaseOptions || phaseOptions.length === 0) return;
    onPhaseFilter(phaseOptions[0]);
  }, [phaseOptions, onPhaseFilter]);

  if (!surveyPhases || !phaseOptions) return null;
  if (phaseOptions.length === 0) return null;

  if (phaseOptions.length === 1) {
    return (
      <Box>
        <Text variant="bodyM" color="textSecondary">
          {localize(surveyPhases[0].attributes.title_multiloc)}
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
