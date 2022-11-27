import React from 'react';
import styled from 'styled-components';
import { OnboardingCampaignName } from 'services/onboardingCampaigns';
import { Left, Right, HeaderContent } from './';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import T from 'components/T';
import useAuthUser from 'hooks/useAuthUser';
import Outlet from 'components/Outlet';
import { media } from 'utils/styleUtils';
import OnboardingStep from './OnboardingStep';

const HeaderContentDefault = styled(HeaderContent)`
  justify-content: center;

  h2 {
    text-align: center;
  }

  ${media.tablet`
    align-items: center;
  `}
`;
interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
}

const FallbackStep = ({ activeOnboardingCampaignName }: Props) => {
  const homepageSettings = useHomepageSettings();
  const authUser = useAuthUser();

  if (!isNilOrError(homepageSettings) && !isNilOrError(authUser)) {
    const defaultMessage =
      homepageSettings.attributes.banner_signed_in_header_multiloc;

    return (
      <OnboardingStep
        isIncomingStep={activeOnboardingCampaignName === 'default'}
      >
        <HeaderContentDefault id="e2e-signed-in-header-default-cta">
          <Left>
            {defaultMessage && !isEmpty(defaultMessage) ? (
              <T as="h2" value={defaultMessage} supportHtml />
            ) : (
              <FormattedMessage
                {...messages.defaultSignedInMessage}
                tagName="h2"
                values={{ firstName: authUser.attributes.first_name }}
              />
            )}
          </Left>
          <Right>
            <Outlet
              id="app.containers.HomePage.SignedInHeader.CTA"
              buttonStyle="primary-inverse"
            />
          </Right>
        </HeaderContentDefault>
      </OnboardingStep>
    );
  }

  return null;
};

export default FallbackStep;
