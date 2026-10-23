import React from 'react';

import { Multiloc } from 'typings';

import useManagedCampaignConsents from 'components/CampaignConsentForm/useManagedCampaignConsents';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaignMultiloc: Multiloc;
  unsubscriptionToken: string;
}

const UnsubscribeSuccessMessage = ({
  campaignMultiloc,
  unsubscriptionToken,
}: Props) => {
  const { data: consents, isError } =
    useManagedCampaignConsents(unsubscriptionToken);

  // Inactive users (e.g. pending invitees) can't manage their preferences, so the list is refused.
  // They wouldn't recognise the campaign's name either, so they get a plain confirmation.
  if (isError) {
    return (
      <FormattedMessage
        {...messages.initialUnsubscribeSuccessWithoutCampaign}
      />
    );
  }

  if (!consents) return null;

  return (
    <FormattedMessage
      {...messages.initialUnsubscribeSuccess}
      values={{ campaignTitle: <T value={campaignMultiloc} /> }}
    />
  );
};

export default UnsubscribeSuccessMessage;
