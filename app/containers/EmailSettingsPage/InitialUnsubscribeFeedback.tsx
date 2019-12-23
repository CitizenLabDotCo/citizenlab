import React from 'react';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Message = styled.div<{ status: 'error' | 'success' | 'loading' }>`
  color: ${colors.clBlueDarker};
`;

interface Props {
  status: 'success' | 'error' | 'loading';
}

const InitialUnsubscribeFeedback = ({ status }: Props) => {
  return (
    <Message status={status}>
      {status === 'success' ? (
        <FormattedMessage {...messages.initialUnsubscribeSuccess} />
      ) : status === 'error' ? (
        <FormattedMessage {...messages.initialUnsubscribeError} />
      ) : status === 'loading' ? (
        <FormattedMessage {...messages.initialUnsubscribeLoading} />
      ) : null}
    </Message>
  );
};

export default InitialUnsubscribeFeedback;
