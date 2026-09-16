import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import phasePermissionKeys from 'api/phase_permissions/keys';
import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phase: IPhaseData;
  /** The method the admin picked; the modal is closed while it's null. */
  method: SurveyMethod | null;
  onClose: () => void;
}

// Switching the kind of survey keeps the phase, but not everything that was
// set up for the previous kind. The admin confirms after reading what goes.
const SwitchSurveyMethodModal = ({ phase, method, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const newPhaseDefaults = useNewPhaseDefaults();
  const { mutate: updatePhase, isPending, error, reset } = useUpdatePhase();

  const current = phase.attributes.participation_method;

  const close = () => {
    reset();
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
        // Keep the survey labels the admin already wrote.
        native_survey_title_multiloc:
          phase.attributes.native_survey_title_multiloc ??
          native_survey_title_multiloc,
        native_survey_button_multiloc:
          phase.attributes.native_survey_button_multiloc ??
          native_survey_button_multiloc,
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
          <Button buttonStyle="secondary-outlined" onClick={close}>
            {formatMessage(messages.switchCancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            processing={isPending}
            onClick={handleConfirm}
          >
            {formatMessage(messages.switchConfirm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text mt="0">{formatMessage(messages.switchSurveyMethodIntro)}</Text>
        <Box as="ul" pl="20px" m="0">
          {consequences.map((message) => (
            <li key={message.id}>
              <Text my="4px">{formatMessage(message)}</Text>
            </li>
          ))}
        </Box>
        {error && <Error apiErrors={error.errors.participation_method} />}
        {error?.errors.base && <Error apiErrors={error.errors.base} />}
      </Box>
    </Modal>
  );
};

export default SwitchSurveyMethodModal;
