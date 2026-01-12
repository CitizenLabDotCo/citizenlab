import React, { useState } from 'react';

import {
  Title,
  Text,
  Box,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  opened: boolean;
  resetSuccess: () => void;
  setClose: () => void;
  date: string;
  name: string;
};

export default ({ opened, resetSuccess, setClose, date, name }: Props) => {
  const [localOpened, setLocaloOpened] = useState(opened);
  const { formatMessage } = useIntl();

  const onClose = () => {
    resetSuccess();
    setLocaloOpened(false);
    setClose();
  };

  return (
    <Modal width={400} opened={localOpened} close={onClose}>
      <Box p="30px">
        <Box display="flex" justifyContent="center">
          <Icon
            name="check-circle"
            fill={colors.green400}
            width="60px"
            height="60px"
          />
        </Box>
        <Title variant="h2" textAlign="center">
          {formatMessage(messages.allDone)}
        </Title>
        <Text textAlign="center">
          <FormattedMessage
            {...messages.confirmation}
            values={{
              name: <b>{name}</b>,
              date,
            }}
          />
        </Text>
      </Box>
    </Modal>
  );
};
