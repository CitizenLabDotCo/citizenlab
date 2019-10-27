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
import { fontSizes, colors } from 'utils/styleUtils';

// events
import { openVerificationModalWithoutContext } from 'containers/App/events';

const Container = styled(FormSection)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 40px;
`;

const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: -5px;
  z-index: 2;
`;

const ShieldIcon = styled(Icon)`
  fill: ${colors.label};
  width: 48px;
  height: 53px;
  margin-left: -5px;
`;

const Content = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  margin-right: 20px;
`;

const Title = styled.h2`
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 2px;
`;

const Text = styled.p`
  font-size: ${fontSizes.large}px;
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

  return (
    <FeatureFlag name="verification">
      <Container className={className}>
        {authUser.data.attributes.verified ?
          <>
            <StyledAvatar
              userId={authUser.data.id}
              size="55px"
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
              <StyledAvatar userId={!isNilOrError(authUser) ? authUser.data.id : null} size="55px" />
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
            <VerifyButton onClick={openVerificationModal}>
              <FormattedMessage {...messages.verifyNow} />
            </VerifyButton>
          </>
        }
      </Container>
    </FeatureFlag>
  );
});

export default VerificationStatus;
