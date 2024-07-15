import React from 'react';

import {
  Title,
  Box,
  Text,
  Radio,
  Button,
} from '@citizenlab/cl2-component-library';

import { EmailConfig } from 'api/permissions_fields/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  config: EmailConfig;
  onClose: () => void;
  onUpdateConfig: (config: EmailConfig) => void;
}

const EmailModal = ({ opened, config, onClose, onUpdateConfig }: Props) => {
  const { formatMessage } = useIntl();

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
      <Box p="32px">
        <Text mt="0" mb="12px" fontWeight="bold">
          {formatMessage(messages.settingPassword)}
        </Text>
        <Radio
          name={'required'}
          value={true}
          currentValue={config.password}
          onChange={() => onUpdateConfig({ ...config, password: true })}
          mb="4px"
          label={formatMessage(messages.required)}
        />
        <Radio
          name={'not-required'}
          value={false}
          currentValue={config.password}
          onChange={() => {
            console.log({ ...config, password: false });
            onUpdateConfig({ ...config, password: false });
          }}
          label={formatMessage(messages.notRequired)}
        />
        <Text mt="28px" mb="12px" fontWeight="bold">
          {formatMessage(messages.emailConfirmationCode)}
        </Text>
        <Radio
          name={'required'}
          value={true}
          currentValue={config.confirmed}
          onChange={() => {}}
          mb="4px"
          label={formatMessage(messages.required)}
        />
        <Radio
          name={'not-required'}
          value={false}
          currentValue={config.confirmed}
          onChange={() => {}}
          label={formatMessage(messages.notRequired)}
        />
        <Box w="100%" display="flex" mt="32px">
          <Button width="auto" buttonStyle="admin-dark" onClick={() => {}}>
            {formatMessage(messages.saveRules)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EmailModal;
