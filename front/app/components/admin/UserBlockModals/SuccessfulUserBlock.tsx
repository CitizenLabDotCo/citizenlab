import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Text, Box, Icon } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import { colors } from 'utils/styleUtils';

type Props = {
  opened: boolean;
  resetSuccess: () => void;
  date: string;
  name: string;
};

export default ({ opened, resetSuccess, date, name }: Props) => {
  const [localOpened, setLocaloOpened] = useState(opened);
  const { formatMessage } = useIntl();

  const onClose = () => {
    resetSuccess();
    setLocaloOpened(false);
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
