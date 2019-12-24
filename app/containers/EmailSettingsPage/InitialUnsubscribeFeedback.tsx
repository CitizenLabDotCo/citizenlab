import React from 'react';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { FormSection } from 'components/UI/FormComponents';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Message = styled.div<{ status: 'error' | 'success' | 'loading' }>`
  color: ${colors.clBlueDarker};
  font-size: ${fontSizes.large}px;
`;

interface Props {
  status: 'success' | 'error' | 'loading';
}

const InitialUnsubscribeFeedback = ({ status }: Props) => {
  return (
    <FormSection>
      <Message status={status} aria-live="polite">
        {status === 'success' ? (
          <FormattedMessage {...messages.initialUnsubscribeSuccess} />
        ) : status === 'error' ? (
          <FormattedMessage {...messages.initialUnsubscribeError} />
        ) : status === 'loading' ? (
          <FormattedMessage {...messages.initialUnsubscribeLoading} />
        ) : null}
      </Message>
    </FormSection>
  );
};

export default InitialUnsubscribeFeedback;
