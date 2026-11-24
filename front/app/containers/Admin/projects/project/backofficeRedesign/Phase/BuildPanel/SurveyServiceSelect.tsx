import React from 'react';

import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';

import { surveyServices, TSurveyService } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';
import useSurveyProviders from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/useSurveyProviders';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

const SURVEY_SERVICE_LABELS: Record<TSurveyService, MessageDescriptor> = {
  typeform: projectMessages.typeform,
  survey_xact: projectMessages.survey_xact,
  survey_monkey: projectMessages.survey_monkey,
  google_forms: projectMessages.google_forms,
  enalyzer: projectMessages.enalyzer,
  qualtrics: projectMessages.qualtrics,
  smart_survey: projectMessages.smart_survey,
  microsoft_forms: projectMessages.microsoft_forms,
  snap_survey: projectMessages.snap_survey,
};

/** The external survey tools this platform can embed, in display order. */
export const useEnabledSurveyServices = () => {
  const surveyProviders = useSurveyProviders();
  return surveyServices.filter((service) => surveyProviders[service]);
};

interface Props {
  value: TSurveyService | null | undefined;
  errorMessage?: string;
  onChange: (service: TSurveyService) => void;
}

const SurveyServiceSelect = ({ value, errorMessage, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const services = useEnabledSurveyServices();

  return (
    <Select
      label={formatMessage(projectMessages.surveyService)}
      value={value ?? null}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
      onChange={(key) => {
        const service = services.find((service) => service === key);
        if (service) onChange(service);
      }}
    >
      {services.map((service) => (
        <ListBoxOption key={service} id={service}>
          {formatMessage(SURVEY_SERVICE_LABELS[service])}
        </ListBoxOption>
      ))}
    </Select>
  );
};

export default SurveyServiceSelect;
