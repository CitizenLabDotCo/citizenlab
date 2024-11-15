import React from 'react';

import { media, isRtl, colors, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import { isEmptyMultiloc, isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import CTA from './CTA';
import OnboardingStep from './OnboardingStep';
import { Left, Right } from './Shared';

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
  color: ${colors.white};

  ${isRtl`
    flex-direction: row-reverse;
  `}

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
  homepageSettings: Partial<IHomepageBannerSettings>;
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
            <Title variant="h2" m="0" color="white">
              {defaultMessage && !isEmptyMultiloc(defaultMessage) ? (
                <T value={defaultMessage} supportHtml />
              ) : (
                <FormattedMessage
                  {...messages.defaultSignedInMessage}
                  values={{ firstName: authUser.data.attributes.first_name }}
                />
              )}
            </Title>
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
