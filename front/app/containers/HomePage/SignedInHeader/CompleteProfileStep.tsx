import React from 'react';

import { Icon, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import AcceptButton from './AcceptButton';
import OnboardingStep from './OnboardingStep';
import { Left, Right, HeaderContent, Icons, StyledAvatar } from './Shared';
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
  const { data: authUser } = useAuthUser();
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
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                userId={authUser?.data.id}
                size={50}
                fillColor="#fff"
                padding={0}
                borderThickness={0}
              />
              <CompleteProfileIcon name="edit" fill="#fff" ariaHidden />
            </Icons>
            <Title variant="h2" color="white">
              <FormattedMessage
                {...messages.completeYourProfile}
                values={{ firstName: authUser.data.attributes.first_name }}
              />
            </Title>
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
