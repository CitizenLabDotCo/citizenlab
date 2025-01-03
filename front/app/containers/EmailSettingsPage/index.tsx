import React, { useEffect, useState } from 'react';

import { Title, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';

import CampaignConsentForm from 'components/CampaignConsentForm';

import { FormattedMessage } from 'utils/cl-intl';

import InitialUnsubscribeFeedback from './InitialUnsubscribeFeedback';
import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 52px;
`;

const EmailSettingPage = () => {
  const [initialUnsubscribeStatus, setInitialUnsubscribeStatus] = useState<
    'error' | 'success' | 'loading' | 'hidden' | null
  >();
  const [unsubscribedCampaignMultiloc, setUnsubscribedCampaignMultiloc] =
    useState<Multiloc | null>(null);

  const [searchParams] = useSearchParams();
  const unsubscriptionToken = searchParams.get('unsubscription_token');
  const campaignId = searchParams.get('campaign_id');

  const { mutate: updateCampaignConsents } = useUpdateCampaignConsents();

  const closeInitialUnsubscribe = () => {
    setInitialUnsubscribeStatus('hidden');
  };

  useEffect(() => {
    if (
      !(
        typeof unsubscriptionToken === 'string' &&
        typeof campaignId === 'string'
      )
    ) {
      setInitialUnsubscribeStatus('error');
    } else {
      setInitialUnsubscribeStatus('loading');

      const consentChanges = [{ campaignId, consented: false }];
      updateCampaignConsents(
        { consentChanges, unsubscriptionToken },
        {
          onSuccess: (data) => {
            setInitialUnsubscribeStatus('success');
            setUnsubscribedCampaignMultiloc(
              data[0].data.attributes.campaign_type_description_multiloc
            );
          },
          onError: () => {
            setInitialUnsubscribeStatus('error');
          },
        }
      );
    }
  }, [unsubscriptionToken, updateCampaignConsents, campaignId]);

  return (
    <main id="e2e-email-settings-page">
      <Container>
        <Title mb="24px">
          <FormattedMessage {...messages.emailSettings} />
        </Title>
        {/* Wrapping with a div is needed for these to have the same width */}
        <div>
          {initialUnsubscribeStatus &&
            initialUnsubscribeStatus !== 'hidden' && (
              <InitialUnsubscribeFeedback
                className="e2e-unsubscribe-status"
                status={initialUnsubscribeStatus}
                unsubscribedCampaignMultiloc={unsubscribedCampaignMultiloc}
              />
            )}
          {initialUnsubscribeStatus &&
            initialUnsubscribeStatus !== 'loading' && (
              <CampaignConsentForm
                trackEventName={tracks.unsubscribedFromLink}
                runOnSave={closeInitialUnsubscribe}
                unsubscriptionToken={unsubscriptionToken}
              />
            )}
        </div>
      </Container>
    </main>
  );
};

export default EmailSettingPage;
