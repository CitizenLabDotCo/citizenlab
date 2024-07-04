import React from 'react';

import {
  Title,
  Box,
  Text,
  Radio,
  Button,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const EmailModal = ({ opened, onClose }: Props) => {
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
          value={'required'}
          currentValue={'required'}
          onChange={() => {}}
          mb="4px"
          label={formatMessage(messages.required)}
        />
        <Radio
          name={'not-required'}
          value={'not-required'}
          currentValue={'required'}
          onChange={() => {}}
          label={formatMessage(messages.notRequired)}
        />
        <Text mt="28px" mb="12px" fontWeight="bold">
          {formatMessage(messages.emailConfirmationCode)}
        </Text>
        <Radio
          name={'required'}
          value={'required'}
          currentValue={'required'}
          onChange={() => {}}
          mb="4px"
          label={formatMessage(messages.required)}
        />
        <Radio
          name={'not-required'}
          value={'not-required'}
          currentValue={'required'}
          onChange={() => {}}
          label={formatMessage(messages.notRequired)}
        />
        <Box w="100%" display="flex" mt="32px">
          <Button width="auto" onClick={() => {}}>
            {formatMessage(messages.saveRules)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EmailModal;
