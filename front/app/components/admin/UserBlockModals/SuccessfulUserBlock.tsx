import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Text, Box, Icon } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  padding: 30px;
`;

type Props = {
  opened: boolean;
  resetSuccess: () => void;
};

export default ({ opened, resetSuccess }: Props) => {
  const [localOpened, setLocaloOpened] = useState(opened);
  const { formatMessage } = useIntl();

  const onClose = () => {
    resetSuccess();
    setLocaloOpened(false);
  };

  return (
    <Modal width={400} opened={localOpened} close={onClose}>
      <Container>
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
          {formatMessage(messages.confirmation, {
            name: 'Wilbur Mayert',
            date: 'Jun 3, 2023',
          })}
        </Text>
      </Container>
    </Modal>
  );
};
