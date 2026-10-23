import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { FormSection } from 'components/UI/FormComponents';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import UnsubscribeSuccessMessage from './UnsubscribeSuccessMessage';

const Message = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.l}px;
`;

interface Props {
  status: 'success' | 'error' | 'loading';
  unsubscribedCampaignMultiloc: Multiloc | null;
  unsubscriptionToken: string | undefined;
  className?: string;
}

const InitialUnsubscribeFeedback = ({
  status,
  unsubscribedCampaignMultiloc,
  unsubscriptionToken,
  className,
}: Props) => {
  return (
    <FormSection className={className || ''}>
      <Message aria-live="polite">
        {status === 'success' &&
        unsubscribedCampaignMultiloc &&
        unsubscriptionToken ? (
          <UnsubscribeSuccessMessage
            campaignMultiloc={unsubscribedCampaignMultiloc}
            unsubscriptionToken={unsubscriptionToken}
          />
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
