// Libraries
import React, { useEffect, useState } from 'react';

// Components
import CampaignConsentForm from 'components/CampaignConsentForm';
import InitialUnsubscribeFeedback from './InitialUnsubscribeFeedback';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

// hooks
import useCampaignConsents from 'api/campaign_consents/useCampaignConsents';
import useUpdateCampaignConsents from 'api/campaign_consents/useUpdateCampaignConsents';

// utils
import { isNilOrError } from 'utils/helperUtils';

// routing
import { useSearchParams } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
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

  const [searchParams, _] = useSearchParams();
  const unsubscriptionToken = searchParams.get('unsubscription_token');
  const campaignId = searchParams.get('campaign_id');

  const { mutate: updateCampaignConsents } = useUpdateCampaignConsents();
  const { data: campaignConsents } = useCampaignConsents(unsubscriptionToken);

  // const closeInitialUnsubscribe = () => {
  //   setInitialUnsubscribeStatus('hidden');
  // };

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

      const consentChanges = [
        { campaignConsentId: campaignId, consented: false },
      ];
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
  });

  if (isNilOrError(campaignConsents)) return null;

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
            // runOnSave={closeInitialUnsubscribe}
          />
        )}
      </div>
    </Container>
  );
};

export default EmailSettingPage;
