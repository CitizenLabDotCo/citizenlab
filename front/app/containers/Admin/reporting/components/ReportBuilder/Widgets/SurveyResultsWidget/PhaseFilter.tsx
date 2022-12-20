import React, { useMemo, useEffect } from 'react';

// hooks
import usePhases from 'hooks/usePhases';

// components
import { Box, Text, Select } from '@citizenlab/cl2-component-library';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

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
  const { formatMessage } = useIntl();

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
          Showing questions for:{' '}
          {localize(surveyPhases[0].attributes.title_multiloc)}
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" mb="20px">
      <Select
        label={formatMessage(messages.surveyPhases)}
        onChange={onPhaseFilter}
        value={phaseId}
        options={phaseOptions}
      />
    </Box>
  );
};

export default PhaseFilter;
