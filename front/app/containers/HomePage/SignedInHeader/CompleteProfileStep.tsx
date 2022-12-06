import React from 'react';
// style
import styled from 'styled-components';
// components
import { Icon } from '@citizenlab/cl2-component-library';
// hooks
import useAuthUser from 'hooks/useAuthUser';
// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';
// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../messages';
import { Left, Right, Text, HeaderContent, Icons, StyledAvatar } from './';
import AcceptButton from './AcceptButton';
import OnboardingStep from './OnboardingStep';
import SkipButton from './SkipButton';

const CompleteProfileIcon = styled(Icon)`
  width: 48px;
  height: 48px;
  margin-left: -3px;
  margin-top: 3px;
  opacity: 0.5;
`;

interface Props {
  onSkip: () => void;
  currentOnboardingCampaignName: OnboardingCampaignName;
}

const CompleteProfileStep = ({
  onSkip,
  currentOnboardingCampaignName,
}: Props) => {
  const authUser = useAuthUser();
  const { formatMessage } = useIntl();

  if (!isNilOrError(authUser)) {
    return (
      <OnboardingStep
        isIncomingStep={currentOnboardingCampaignName === 'complete_profile'}
      >
        <HeaderContent id="e2e-signed-in-header-complete-profile">
          <Left>
            <Icons>
              <StyledAvatar
                userId={authUser?.id}
                size={50}
                fillColor="#fff"
                padding={0}
                borderThickness={0}
              />
              <CompleteProfileIcon name="edit" fill="#fff" ariaHidden />
            </Icons>
            <Text>
              <FormattedMessage
                {...messages.completeYourProfile}
                tagName="h2"
                values={{ firstName: authUser.attributes.first_name }}
              />
            </Text>
          </Left>

          <Right>
            <SkipButton
              onClick={onSkip}
              className="e2e-signed-in-header-complete-skip-btn"
            />
            <AcceptButton
              linkTo="/profile/edit"
              className="e2e-signed-in-header-accept-btn"
              text={formatMessage(messages.completeProfile)}
            />
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default CompleteProfileStep;
