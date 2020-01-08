import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// components
import FeatureFlag from 'components/FeatureFlag';
import { FormSection } from 'components/UI/FormComponents';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

// events
import { openVerificationModalWithoutContext } from 'containers/App/events';

const Container = styled(FormSection)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 40px;

  ${media.smallerThanMaxTablet`
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
  fill: ${colors.label};
  width: 48px;
  height: 53px;
  margin-left: -4px;
`;

const Content = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-left: 00px;
    margin-right: 00px;
    margin-top: 20px;
    margin-bottom: 20px;
  `}
`;

const Title = styled.h2`
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 4px;
`;

const Text = styled.p`
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
`;

const VerifyButton = styled(Button)``;

const VerificationStatus = memo(({ className }: { className?: string }) => {
  const authUser = useAuthUser();

  const openVerificationModal = useCallback(() => {
    openVerificationModalWithoutContext('VerificationStatus');
  }, []);

  if (isNilOrError(authUser)) return null;

  const authIsVerified = authUser.data.attributes.verified;

  return (
    <FeatureFlag name="verification">
      <Container className={`${className} e2e${authIsVerified ? '' : '-not'}-verified`}>
        {authIsVerified ?
          <>
            <StyledAvatar
              userId={authUser.data.id}
              size="52px"
              verified
              aria-hidden
            />
            <Content>
              <Title>
                <FormattedMessage {...messages.verifiedTitle} />
              </Title>
              <Text>
                <FormattedMessage {...messages.verifiedText} />
              </Text>
            </Content>
          </>
          :
          <>
            <AvatarAndShield aria-hidden>
              <StyledAvatar
                userId={authUser?.data?.id}
                size="52px"
                bgColor="transparent"
                padding="0px"
                borderThickness="2px"
                borderColor="#fff"
              />
              <ShieldIcon name="verify" />
            </AvatarAndShield>
            <Content>
              <Title>
                <FormattedMessage {...messages.verifyTitle} />
              </Title>
              <Text>
                <FormattedMessage {...messages.verifyText} />
              </Text>
            </Content>
            <VerifyButton onClick={openVerificationModal} id="e2e-verify-user-button">
              <FormattedMessage {...messages.verifyNow} />
            </VerifyButton>
          </>
        }
      </Container>
    </FeatureFlag>
  );
});

export default VerificationStatus;
