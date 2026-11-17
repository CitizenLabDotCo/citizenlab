import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import T from 'components/T';
import { FormSection } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Message = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.l}px;
`;

interface Props {
  status: 'success' | 'error' | 'loading';
  unsubscribedCampaignMultiloc: Multiloc | null;
  canManagePreferences: boolean;
  className?: string;
}

const InitialUnsubscribeFeedback = ({
  status,
  unsubscribedCampaignMultiloc,
  canManagePreferences,
  className,
}: Props) => {
  return (
    <FormSection className={className || ''}>
      <Message aria-live="polite">
        {status === 'success' &&
        canManagePreferences &&
        unsubscribedCampaignMultiloc ? (
          <FormattedMessage
            {...messages.initialUnsubscribeSuccess}
            values={{
              campaignTitle: <T value={unsubscribedCampaignMultiloc} />,
            }}
          />
        ) : status === 'success' ? (
          // Users who can't manage their preferences (e.g. a pending invitee) wouldn't recognise the campaign's name.
          <FormattedMessage
            {...messages.initialUnsubscribeSuccessWithoutCampaign}
          />
        ) : status === 'error' ? (
          <FormattedMessage {...messages.initialUnsubscribeError} />
        ) : (
          <FormattedMessage {...messages.initialUnsubscribeLoading} />
        )}
      </Message>
    </FormSection>
  );
};

export default InitialUnsubscribeFeedback;
