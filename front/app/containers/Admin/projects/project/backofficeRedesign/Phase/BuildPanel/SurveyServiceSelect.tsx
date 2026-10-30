import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { TSurveyService } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';
import useSurveyProviders from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/useSurveyProviders';

import { useIntl } from 'utils/cl-intl';

const SURVEY_SERVICE_LABELS = {
  typeform: projectMessages.typeform,
  survey_xact: projectMessages.survey_xact,
  survey_monkey: projectMessages.survey_monkey,
  google_forms: projectMessages.google_forms,
  enalyzer: projectMessages.enalyzer,
  qualtrics: projectMessages.qualtrics,
  smart_survey: projectMessages.smart_survey,
  microsoft_forms: projectMessages.microsoft_forms,
  snap_survey: projectMessages.snap_survey,
} as const;

const SURVEY_SERVICES = Object.keys(SURVEY_SERVICE_LABELS) as TSurveyService[];

/** The external survey tools this platform can embed, in display order. */
export const useEnabledSurveyServices = () => {
  const surveyProviders = useSurveyProviders();
  return SURVEY_SERVICES.filter((service) => surveyProviders[service]);
};

interface Props {
  value: TSurveyService | null | undefined;
  onChange: (service: TSurveyService) => void;
}

const SurveyServiceSelect = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const services = useEnabledSurveyServices();

  return (
    <Select
      variant="bo"
      label={formatMessage(projectMessages.surveyService)}
      value={value}
      options={services.map((service) => ({
        value: service,
        label: formatMessage(SURVEY_SERVICE_LABELS[service]),
      }))}
      onChange={(option) => onChange(option.value)}
    />
  );
};

export default SurveyServiceSelect;
