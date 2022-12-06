import React from 'react';
import styled from 'styled-components';
import { Icon } from '@citizenlab/cl2-component-library';
import useAuthUser from 'hooks/useAuthUser';
import { OnboardingCampaignName } from 'services/onboardingCampaigns';
import { openVerificationModal } from 'events/verificationModal';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import { HeaderContent, Left, Right, Text, Icons, StyledAvatar } from '.';
import messages from '../messages';
import AcceptButton from './AcceptButton';
import OnboardingStep from './OnboardingStep';
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
  const authUser = useAuthUser();
  const { formatMessage } = useIntl();

  const onAccept = () => {
    openVerificationModal();
  };

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
                  userId={authUser.id}
                  size={50}
                  fillColor="#fff"
                  padding={0}
                  borderThickness={0}
                />
                <ShieldIcon name="shield-check" />
              </AvatarAndShield>
            </Icons>
            <Text>
              <FormattedMessage {...messages.verifyYourIdentity} tagName="h2" />
            </Text>
          </Left>

          <Right>
            <SkipButton
              onClick={onSkip}
              className="e2e-signed-in-header-verification-skip-btn"
            />
            <AcceptButton
              text={formatMessage(messages.verifyNow)}
              onClick={onAccept}
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
