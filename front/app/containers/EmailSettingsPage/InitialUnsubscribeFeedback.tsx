import React, { memo } from 'react';
import { Multiloc } from 'typings';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import T from 'components/T';
// components
import { FormSection } from 'components/UI/FormComponents';
// styling
import styled from 'styled-components';
import messages from './messages';

const Message = styled.div<{ status: 'error' | 'success' | 'loading' }>`
  color: ${colors.teal700};
  font-size: ${fontSizes.l}px;
`;

interface Props {
  status: 'success' | 'error' | 'loading';
  unsubscribedCampaignMultiloc: Multiloc | null;
  className?: string;
}

const InitialUnsubscribeFeedback = memo<Props>(
  ({ status, unsubscribedCampaignMultiloc, className }) => {
    return (
      <FormSection className={className || ''}>
        <Message status={status} aria-live="polite">
          {status === 'success' && unsubscribedCampaignMultiloc ? (
            <FormattedMessage
              {...messages.initialUnsubscribeSuccess}
              values={{
                campaignTitle: <T value={unsubscribedCampaignMultiloc} />,
              }}
            />
          ) : status === 'error' ? (
            <FormattedMessage {...messages.initialUnsubscribeError} />
          ) : status === 'loading' ? (
            <FormattedMessage {...messages.initialUnsubscribeLoading} />
          ) : null}
        </Message>
      </FormSection>
    );
  }
);

export default InitialUnsubscribeFeedback;
