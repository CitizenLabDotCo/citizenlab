import React, { useEffect, useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import CampaignConsentForm from 'components/CampaignConsentForm';

import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';

import InitialUnsubscribeFeedback from './InitialUnsubscribeFeedback';

// Styles

// routing

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 78px - 78px);
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 50px;
  overflow-x: hidden;
`;

const StyledInitialFeedback = styled(InitialUnsubscribeFeedback)`
  flex-grow: 1;
`;

const StyledCampaignConsentForm = styled(CampaignConsentForm)`
  flex-grow: 1;
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
    <Container id="e2e-email-settings-page">
      <div>
        {initialUnsubscribeStatus && initialUnsubscribeStatus !== 'hidden' && (
          <StyledInitialFeedback
            className="e2e-unsubscribe-status"
            status={initialUnsubscribeStatus}
            unsubscribedCampaignMultiloc={unsubscribedCampaignMultiloc}
          />
        )}
        {initialUnsubscribeStatus && initialUnsubscribeStatus !== 'loading' && (
          <StyledCampaignConsentForm
            trackEventName="Unsubcribed from unsubscribe link flow"
            runOnSave={closeInitialUnsubscribe}
            unsubscriptionToken={unsubscriptionToken}
          />
        )}
      </div>
    </Container>
  );
};

export default EmailSettingPage;
