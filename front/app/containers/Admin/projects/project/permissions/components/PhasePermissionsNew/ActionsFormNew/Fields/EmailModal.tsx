import React from 'react';

import { Title, Box, Text, Radio } from '@citizenlab/cl2-component-library';

import { EmailConfig } from 'api/permissions_fields/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import parentMessages from '../messages';
import Tooltip from '../Tooltip';

import messages from './messages';

interface Props {
  opened: boolean;
  config: EmailConfig;
  disableEditing: boolean;
  onClose: () => void;
  onUpdateConfig: (config: EmailConfig) => void;
}

const EmailModal = ({
  opened,
  config,
  disableEditing,
  onClose,
  onUpdateConfig,
}: Props) => {
  const { formatMessage } = useIntl();

  const emailConfirmationDisabledMessage = disableEditing
    ? parentMessages.disableEditingExplanationFromModal
    : messages.emailConfirmationCannotBeControlledYet;

  return (
    <Modal
      opened={opened}
      niceHeader
      header={
        <Title variant="h3" m="0" ml="32px">
          {formatMessage(messages.emailAndPasswordHeader)}
        </Title>
      }
      close={onClose}
    >
      <Box p="32px" w="248px">
        <Box>
          <Tooltip
            disabled={!disableEditing}
            message={parentMessages.disableEditingExplanationFromModal}
          >
            <>
              <Text mt="0" mb="12px" fontWeight="bold">
                {formatMessage(messages.settingPassword)}
              </Text>
              <Radio
                name={'required'}
                value={true}
                currentValue={config.password}
                onChange={() => onUpdateConfig({ ...config, password: true })}
                mb="4px"
                disabled={disableEditing}
                label={formatMessage(messages.required)}
              />
              <Radio
                name={'not-required'}
                value={false}
                currentValue={config.password}
                onChange={() => {
                  onUpdateConfig({ ...config, password: false });
                }}
                disabled={disableEditing}
                label={formatMessage(messages.notRequired)}
              />
            </>
          </Tooltip>
          <Tooltip disabled={false} message={emailConfirmationDisabledMessage}>
            <>
              <Text mt="28px" mb="12px" fontWeight="bold">
                {formatMessage(messages.emailConfirmationCode)}
              </Text>
              <Radio
                name={'required'}
                value={true}
                currentValue={config.confirmed}
                onChange={() => onUpdateConfig({ ...config, confirmed: true })}
                mb="4px"
                disabled={true}
                label={formatMessage(messages.required)}
              />
              <Radio
                name={'not-required'}
                value={false}
                currentValue={config.confirmed}
                onChange={() => onUpdateConfig({ ...config, confirmed: false })}
                disabled={true}
                label={formatMessage(messages.notRequired)}
              />
            </>
          </Tooltip>
        </Box>
      </Box>
    </Modal>
  );
};

export default EmailModal;
