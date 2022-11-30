import React from 'react';
import styled from 'styled-components';
import { OnboardingCampaignName } from 'services/onboardingCampaigns';
import { Left, Right } from './';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import T from 'components/T';
import useAuthUser from 'hooks/useAuthUser';
import Outlet from 'components/Outlet';
import { media, isRtl, fontSizes } from 'utils/styleUtils';
import OnboardingStep from './OnboardingStep';

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
}

const FallbackStep = ({ currentOnboardingCampaignName }: Props) => {
  const homepageSettings = useHomepageSettings();
  const authUser = useAuthUser();

  if (!isNilOrError(homepageSettings) && !isNilOrError(authUser)) {
    const defaultMessage =
      homepageSettings.attributes.banner_signed_in_header_multiloc;

    return (
      <OnboardingStep
        isIncomingStep={currentOnboardingCampaignName === 'default'}
      >
        <HeaderContent id="e2e-signed-in-header-default-cta">
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
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default FallbackStep;
