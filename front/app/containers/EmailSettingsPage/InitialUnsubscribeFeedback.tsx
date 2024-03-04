import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { FormSection } from 'components/UI/FormComponents';

import styled from 'styled-components';
import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';
import T from 'components/T';

const Message = styled.div`
  color: ${colors.teal700};
  font-size: ${fontSizes.l}px;
`;

interface Props {
  status: 'success' | 'error' | 'loading';
  unsubscribedCampaignMultiloc: Multiloc | null;
  className?: string;
}

const InitialUnsubscribeFeedback = ({
  status,
  unsubscribedCampaignMultiloc,
  className,
}: Props) => {
  return (
    <FormSection className={className || ''}>
      <Message aria-live="polite">
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
};

export default InitialUnsubscribeFeedback;
