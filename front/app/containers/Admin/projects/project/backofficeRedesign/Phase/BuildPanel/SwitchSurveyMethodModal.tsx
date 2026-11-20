import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import Banner from 'design-system/Banner';
import Modal from 'design-system/Modal';

import phasePermissionKeys from 'api/phase_permissions/keys';
import { IPhaseData, TSurveyService } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { useIntl } from 'utils/cl-intl';

import styles from './BuildPanel.module.css';
import ExternalSurveyFields from './ExternalSurveyFields';
import messages from './messages';
import { useEnabledSurveyServices } from './SurveyServiceSelect';

interface Props {
  phase: IPhaseData;
  method: SurveyMethod | null;
  onClose: () => void;
}

const SwitchSurveyMethodModal = ({ phase, method, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const newPhaseDefaults = useNewPhaseDefaults();
  const { mutate: updatePhase, isPending, error, reset } = useUpdatePhase();
  const services = useEnabledSurveyServices();
  const apiErrorText = useApiErrorText();
  const [surveyService, setSurveyService] = useState<TSurveyService>();
  const [surveyEmbedUrl, setSurveyEmbedUrl] = useState('');

  const current = phase.attributes.participation_method;
  // An external survey can't be saved without its tool and link.
  const toExternal = method === 'survey';
  const selectedService = surveyService ?? services[0];

  const close = () => {
    reset();
    setSurveyService(undefined);
    setSurveyEmbedUrl('');
    onClose();
  };

  const handleConfirm = () => {
    if (!method || !newPhaseDefaults) return;

    const {
      native_survey_title_multiloc,
      native_survey_button_multiloc,
      ...defaults
    } = newPhaseDefaults(method);

    updatePhase(
      {
        phaseId: phase.id,
        ...defaults,
        native_survey_title_multiloc:
          phase.attributes.native_survey_title_multiloc ??
          native_survey_title_multiloc,
        native_survey_button_multiloc:
          phase.attributes.native_survey_button_multiloc ??
          native_survey_button_multiloc,
        ...(toExternal && {
          survey_service: selectedService,
          survey_embed_url: surveyEmbedUrl,
        }),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: phasePermissionKeys.lists(),
          });
          close();
        },
      }
    );
  };

  const consequences = [
    messages.switchLosesAccessSettings,
    ...(current === 'native_survey' ? [messages.switchHidesSurveyForm] : []),
    ...(current === 'survey' ? [messages.switchClearsEmbedUrl] : []),
    messages.switchChangesNotifications,
  ];

  const errorTexts = [
    apiErrorText(error?.errors.participation_method),
    apiErrorText(error?.errors.base),
  ].filter((text) => !!text);

  return (
    <Modal
      isOpen={method !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
      size={560}
      title={formatMessage(messages.switchSurveyMethodTitle)}
      secondaryAction={{
        label: formatMessage(messages.switchCancel),
        onPress: close,
      }}
      primaryAction={{
        label: formatMessage(messages.switchConfirm),
        isPending,
        isDisabled: toExternal && !surveyEmbedUrl.trim(),
        onPress: handleConfirm,
      }}
    >
      <div className={styles.switchBody}>
        <p className={styles.switchIntro}>
          {formatMessage(messages.switchSurveyMethodIntro)}
        </p>
        <ul className={styles.consequences}>
          {consequences.map((message) => (
            <li key={message.id} className={styles.consequence}>
              {formatMessage(message)}
            </li>
          ))}
        </ul>
        {toExternal && (
          <div className={styles.externalFields}>
            <ExternalSurveyFields
              service={selectedService}
              embedUrl={surveyEmbedUrl}
              errors={error?.errors}
              onServiceChange={setSurveyService}
              onEmbedUrlChange={setSurveyEmbedUrl}
            />
          </div>
        )}
        {errorTexts.length > 0 && (
          <div className={styles.errors}>
            {errorTexts.map((text) => (
              <Banner key={text} tone="error">
                {text}
              </Banner>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SwitchSurveyMethodModal;
