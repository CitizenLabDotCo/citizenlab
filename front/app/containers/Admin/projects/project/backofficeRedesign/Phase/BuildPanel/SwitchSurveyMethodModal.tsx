import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import phasePermissionKeys from 'api/phase_permissions/keys';
import { IPhaseData, TSurveyService } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ExternalSurveyFields from './ExternalSurveyFields';
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

  return (
    <Modal
      opened={method !== null}
      close={close}
      width={560}
      header={formatMessage(messages.switchSurveyMethodTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-secondary" onClick={close}>
            {formatMessage(messages.switchCancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            processing={isPending}
            disabled={toExternal && !surveyEmbedUrl.trim()}
            onClick={handleConfirm}
          >
            {formatMessage(messages.switchConfirm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boHelper" mb="12px">
          {formatMessage(messages.switchSurveyMethodIntro)}
        </Text>
        <Box as="ul" pl="20px" m="0">
          {consequences.map((message) => (
            <li key={message.id}>
              <Text variant="boHelper" my="4px">
                {formatMessage(message)}
              </Text>
            </li>
          ))}
        </Box>
        {toExternal && (
          <Box mt="20px">
            <ExternalSurveyFields
              service={selectedService}
              embedUrl={surveyEmbedUrl}
              errors={error?.errors}
              onServiceChange={setSurveyService}
              onEmbedUrlChange={setSurveyEmbedUrl}
            />
          </Box>
        )}
        {error && <Error apiErrors={error.errors.participation_method} />}
        {error?.errors.base && <Error apiErrors={error.errors.base} />}
      </Box>
    </Modal>
  );
};

export default SwitchSurveyMethodModal;
