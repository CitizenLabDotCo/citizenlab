import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { ParticipationMethod, TSurveyService } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import pickerMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/messages';
import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ChoiceRadio from './ChoiceRadio';
import ExternalSurveyFields from './ExternalSurveyFields';
import NativeSurveyOption from './NativeSurveyOption';
import PanelField from './PanelField';
import PollOption from './PollOption';

const NAME = 'survey-method';

export interface SurveyMethodSwitch {
  disabledReasons?: Partial<Record<SurveyMethod, string>>;
  onSelect: (method: SurveyMethod) => void;
}

export interface ExternalSurveyChanges {
  survey_service?: TSurveyService;
  survey_embed_url?: string;
}

interface Props extends SurveyMethodSwitch {
  projectId: string;
  phaseId?: string;
  selected: ParticipationMethod;
  surveyService: TSurveyService | null | undefined;
  surveyEmbedUrl: string | null | undefined;
  errors: CLErrors | null;
  onExternalSurveyChange: (changes: ExternalSurveyChanges) => void;
}

const SurveyMethodSection = ({
  projectId,
  phaseId,
  selected,
  disabledReasons = {},
  onSelect,
  surveyService,
  surveyEmbedUrl,
  errors,
  onExternalSurveyChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const surveysEnabled = useFeatureFlag({ name: 'surveys' });
  const pollsEnabled = useFeatureFlag({ name: 'polls' });

  const options = [
    {
      method: 'native_survey' as const,
      title: formatMessage(pickerMessages.survey),
      description: formatMessage(messages.nativeSurveyOptionDescription),
      shown: true,
    },
    {
      method: 'poll' as const,
      title: formatMessage(pickerMessages.quickPoll),
      description: formatMessage(pickerMessages.quickPollDescription),
      shown: pollsEnabled || selected === 'poll',
    },
    {
      method: 'survey' as const,
      title: formatMessage(pickerMessages.externalSurvey),
      description: formatMessage(pickerMessages.embedSurvey),
      shown: surveysEnabled || selected === 'survey',
    },
  ];

  return (
    <PanelField label={formatMessage(pickerMessages.surveyOptions)}>
      <Box display="flex" flexDirection="column" gap="20px">
        {options
          .filter(({ shown }) => shown)
          .map(({ method, title, description }) => {
            if (method === selected && phaseId && method === 'native_survey') {
              return (
                <NativeSurveyOption
                  key={method}
                  projectId={projectId}
                  phaseId={phaseId}
                  name={NAME}
                  title={title}
                  description={description}
                />
              );
            }

            if (method === selected && phaseId && method === 'poll') {
              return (
                <PollOption
                  key={method}
                  phaseId={phaseId}
                  name={NAME}
                  title={title}
                  description={description}
                />
              );
            }

            return (
              <Box
                key={method}
                display="flex"
                flexDirection="column"
                gap="12px"
              >
                <ChoiceRadio
                  name={NAME}
                  value={method}
                  currentValue={selected}
                  title={title}
                  description={description}
                  disabledReason={disabledReasons[method]}
                  onChange={() => {
                    if (method !== selected) onSelect(method);
                  }}
                />
                {method === selected && method !== 'survey' && (
                  <Text variant="boHelper" m="0">
                    {formatMessage(messages.saveToEditForm)}
                  </Text>
                )}
                {method === selected && method === 'survey' && (
                  <ExternalSurveyFields
                    service={surveyService}
                    embedUrl={surveyEmbedUrl}
                    errors={errors}
                    onServiceChange={(survey_service) =>
                      onExternalSurveyChange({ survey_service })
                    }
                    onEmbedUrlChange={(survey_embed_url) =>
                      onExternalSurveyChange({ survey_embed_url })
                    }
                  />
                )}
              </Box>
            );
          })}
      </Box>
    </PanelField>
  );
};

export default SurveyMethodSection;
