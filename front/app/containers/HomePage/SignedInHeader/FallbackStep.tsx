import React from 'react';
import styled from 'styled-components';
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';
import { Left, Right } from './';
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import T from 'components/T';
import useAuthUser from 'api/me/useAuthUser';
import { media, isRtl, fontSizes } from '@citizenlab/cl2-component-library';
import OnboardingStep from './OnboardingStep';
import CTA from './CTA';
import { IHomepageSettingsAttributes } from 'api/home_page/types';

const HeaderContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 75px;
  padding-right: 75px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  h2 {
    color: #fff;
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 400;
  }

  ${media.tablet`
    text-align: center;
    padding-left: 30px;
    padding-right: 30px;
    flex-direction: column;
    align-items: center;
  `}

  ${media.phone`
    align-items: stretch;
  `}
`;

interface Props {
  currentOnboardingCampaignName: OnboardingCampaignName;
  homepageSettings: Partial<IHomepageSettingsAttributes>;
}

const FallbackStep = ({
  currentOnboardingCampaignName,
  homepageSettings,
}: Props) => {
  const { data: authUser } = useAuthUser();

  if (!isNilOrError(homepageSettings) && !isNilOrError(authUser)) {
    const defaultMessage = homepageSettings.banner_signed_in_header_multiloc;

    return (
      <OnboardingStep
        isIncomingStep={currentOnboardingCampaignName === 'default'}
      >
        <HeaderContent id="e2e-signed-in-header-default-cta">
          <Left>
            {defaultMessage && !isEmptyMultiloc(defaultMessage) ? (
              <T as="h2" value={defaultMessage} supportHtml />
            ) : (
              <FormattedMessage
                {...messages.defaultSignedInMessage}
                tagName="h2"
                values={{ firstName: authUser.data.attributes.first_name }}
              />
            )}
          </Left>
          <Right>
            <CTA
              buttonStyle="primary-inverse"
              homepageSettings={homepageSettings}
            />
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default FallbackStep;
