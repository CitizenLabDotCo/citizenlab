import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Button } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const Container = styled.div`
  padding: 30px;
`;

export default () => {
  const { formatMessage } = useIntl();

  return (
    <Modal width={334} close={() => {}} opened={true}>
      <Container>
        <Title variant="h2">{formatMessage(messages.confirmUnblock)}</Title>
        <Button>{formatMessage(messages.unblockAction)}</Button>
        <Button>{formatMessage(messages.cancel)}</Button>
      </Container>
    </Modal>
  );
};
