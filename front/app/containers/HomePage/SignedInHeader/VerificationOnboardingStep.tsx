import React from 'react';

import {
  Icon,
  colors,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';

import { triggerVerificationOnly } from 'containers/Authentication/events';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import AcceptButton from './AcceptButton';
import OnboardingStep from './OnboardingStep';
import { HeaderContent, Left, Right, Icons, StyledAvatar } from './Shared';
import SkipButton from './SkipButton';

const ShieldIcon = styled(Icon)`
  fill: ${colors.white};
  opacity: 0.5;
  width: 50px;
  height: 50px;
  margin-left: -3px;
`;

const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Props {
  currentOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const VerificationOnboardingStep = ({
  onSkip,
  currentOnboardingCampaignName,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isSmallerThanPhone = useBreakpoint('phone');
  const isTablet = isSmallerThanTablet && !isSmallerThanPhone;

  if (!isNilOrError(authUser)) {
    return (
      <OnboardingStep
        isIncomingStep={currentOnboardingCampaignName === 'verification'}
      >
        <HeaderContent id="e2e-signed-in-header-verification">
          <Left>
            <Icons>
              <AvatarAndShield aria-hidden>
                <StyledAvatar
                  userId={authUser.data.id}
                  size={50}
                  fillColor="#fff"
                  padding={0}
                  borderThickness={0}
                />
                <ShieldIcon name="shield-check" />
              </AvatarAndShield>
            </Icons>
            <Title
              variant="h2"
              m="0"
              my={isTablet ? '16px' : undefined}
              color="white"
            >
              <FormattedMessage {...messages.verifyYourIdentity} />
            </Title>
          </Left>

          <Right>
            <SkipButton
              onClick={onSkip}
              className="e2e-signed-in-header-verification-skip-btn"
            />
            <AcceptButton
              text={formatMessage(messages.verifyNow)}
              onClick={triggerVerificationOnly}
              className="e2e-signed-in-header-accept-btn"
            />
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default VerificationOnboardingStep;
