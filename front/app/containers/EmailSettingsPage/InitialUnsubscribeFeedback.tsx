import React, { memo } from 'react';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { FormSection } from 'components/UI/FormComponents';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Multiloc } from 'typings';
import T from 'components/T';

const Message = styled.div<{ status: 'error' | 'success' | 'loading' }>`
  color: ${colors.clBlueDarker};
  font-size: ${fontSizes.large}px;
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
