import React, { ReactNode } from 'react';

import { CLErrors } from 'typings';

import Button from 'design-system/Button';
import RadioGroup from 'design-system/RadioGroup';
import Text from 'design-system/Text';

import { ParticipationMethod, TSurveyService } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';
import pickerMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/messages';
import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';

import { useIntl } from 'utils/cl-intl';

import panelStyles from '../BuildPanel.module.css';
import ExternalSurveyFields from '../ExternalSurveyFields';
import NativeSurveyOption from '../NativeSurveyOption';
import PanelField from '../PanelField';
import PollOption from '../PollOption';

import styles from './BuildFields.module.css';
import messages from './messages';
import formSectionMessages from './MethodSection/FormSection/messages';
import methodSectionMessages from './MethodSection/messages';

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
  draftQuestionsAction?: ReactNode;
  onAddQuestions: () => void;
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
  draftQuestionsAction,
  onAddQuestions,
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

  const label = formatMessage(pickerMessages.surveyOptions);

  return (
    <PanelField reviewKey="survey_method" label={label} spacedBody>
      <div className={styles.choice}>
        <RadioGroup
          aria-label={label}
          name={NAME}
          value={selected}
          onChange={(value) => {
            const option = options.find(({ method }) => method === value);
            if (option && option.method !== selected) onSelect(option.method);
          }}
        >
          <div className={styles.choices}>
            {options
              .filter(({ shown }) => shown)
              .map(({ method, title, description }) => {
                if (
                  method === selected &&
                  phaseId &&
                  method === 'native_survey'
                ) {
                  return (
                    <NativeSurveyOption
                      key={method}
                      projectId={projectId}
                      phaseId={phaseId}
                      title={title}
                      description={description}
                      onAddQuestions={onAddQuestions}
                    />
                  );
                }

                if (method === selected && phaseId && method === 'poll') {
                  return (
                    <PollOption
                      key={method}
                      phaseId={phaseId}
                      title={title}
                      description={description}
                    />
                  );
                }

                return (
                  <div key={method} className={styles.choice}>
                    <ChoiceRadio
                      value={method}
                      title={title}
                      description={description}
                      disabledReason={disabledReasons[method]}
                    />
                    {method === selected &&
                      method === 'native_survey' &&
                      draftQuestionsAction && (
                        <div className={panelStyles.questionActions}>
                          <Button
                            variant="quiet"
                            icon="download-16"
                            aria-label={formatMessage(
                              methodSectionMessages.downloadForm
                            )}
                            disabledReason={formatMessage(
                              methodSectionMessages.addQuestionsToDownload
                            )}
                          />
                          {draftQuestionsAction}
                        </div>
                      )}
                    {method === selected && method === 'poll' && (
                      <Text variant="ui" tone="secondary">
                        {formatMessage(formSectionMessages.saveToEditForm)}
                      </Text>
                    )}
                  </div>
                );
              })}
          </div>
        </RadioGroup>
        {/* Outside the group, whose arrow keys would move the selection while
          typing. External survey is the last option, so it still sits under it. */}
        {selected === 'survey' && (
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
      </div>
    </PanelField>
  );
};

export default SurveyMethodSection;
