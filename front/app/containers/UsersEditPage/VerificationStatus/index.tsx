import React, { memo, useCallback } from 'react';
import { Icon } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
// hooks
import useAuthUser from 'hooks/useAuthUser';
import { openVerificationModal } from 'events/verificationModal';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes, colors, media } from 'utils/styleUtils';
import messages from 'containers/UsersEditPage/messages';
import Avatar from 'components/Avatar';
// components
import FeatureFlag from 'components/FeatureFlag';
import Button from 'components/UI/Button';
import { FormSection } from 'components/UI/FormComponents';
// styling
import styled from 'styled-components';

const Container = styled(FormSection)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 40px;

  ${media.tablet`
    flex-direction: column;
    align-items: flex-start;
    justify-content: left;
  `}
`;

const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: -4px;
  z-index: 2;
`;

const ShieldIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  opacity: 0.5;
  width: 48px;
  height: 48px;
  margin-left: -4px;
`;

const Content = styled.div`
  margin-left: 30px;
  margin-right: 20px;

  ${media.tablet`
    text-align: left;
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 20px;
    margin-bottom: 20px;
  `}
`;

const Title = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
  padding: 0;
  margin: 0;
`;

const Text = styled.p`
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin: 0px;
  margin-top: 16px;
`;

const StyledText = styled(Text)`
  margin-top: 10px;
`;

const VerifyButton = styled(Button)``;

const ReverifyButton = styled.button`
  color: ${colors.teal};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  white-space: normal;
  text-align: left;
  text-decoration: underline;
  display: inline;
  padding: 0px;
  margin: 0px;
  border: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.teal)};
    text-decoration: underline;
  }
`;

const VerificationStatus = memo(({ className }: { className?: string }) => {
  const authUser = useAuthUser();

  const onVerify = useCallback(() => {
    openVerificationModal();
  }, []);

  if (isNilOrError(authUser)) return null;

  const authUserIsVerified = authUser.attributes.verified;

  const reverifyButton = (
    <ReverifyButton className="e2e-reverify-user-button" onClick={onVerify}>
      <FormattedMessage {...messages.clickHereToUpdateVerification} />
    </ReverifyButton>
  );

  return (
    <FeatureFlag name="verification">
      <Container
        id="e2e-verification-status"
        className={`${className} e2e${
          authUserIsVerified ? '' : '-not'
        }-verified`}
      >
        {authUserIsVerified ? (
          <>
            <StyledAvatar
              userId={authUser.id}
              size={52}
              addVerificationBadge
              aria-hidden
            />
            <Content>
              <Title>
                <FormattedMessage {...messages.verifiedIdentityTitle} />
              </Title>
              <Text>
                <FormattedMessage {...messages.verifiedIdentitySubtitle} />
              </Text>
              <Text>
                <FormattedMessage
                  {...messages.updateverification}
                  values={{ reverifyButton }}
                />
              </Text>
            </Content>
          </>
        ) : (
          <>
            <AvatarAndShield aria-hidden>
              <StyledAvatar
                userId={authUser?.id}
                size={52}
                bgColor="transparent"
                padding={0}
                borderThickness={2}
                borderColor="#fff"
              />
              <ShieldIcon name="shield-check" />
            </AvatarAndShield>
            <Content>
              <Title>
                <FormattedMessage {...messages.becomeVerifiedTitle} />
              </Title>
              <StyledText>
                <FormattedMessage {...messages.becomeVerifiedSubtitle} />
              </StyledText>
            </Content>
            <VerifyButton onClick={onVerify} id="e2e-verify-user-button">
              <FormattedMessage {...messages.verifyNow} />
            </VerifyButton>
          </>
        )}
      </Container>
    </FeatureFlag>
  );
});

export default VerificationStatus;
