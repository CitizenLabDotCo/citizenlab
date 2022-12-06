import React, { memo, useCallback } from 'react';
// hooks
import useAuthUser from 'hooks/useAuthUser';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes, colors } from 'utils/styleUtils';
import { Title } from 'components/AuthProviders/styles';
// components
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
// style
import styled from 'styled-components';
// svg
import illustration from './illustration.svg';
import messages from './messages';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 30px;
`;

const ImageAvatarContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
`;

const StyledAvatar = styled(Avatar)`
  position: absolute;
  bottom: 0;
  left: calc(50% - 48px);
`;

const Subtitle = styled.h2`
  width: 100%;
  max-width: 500px;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

interface Props {
  onClose: () => void;
  className?: string;
}

export default memo<Props>(({ onClose, className }) => {
  const authUser = useAuthUser();

  const handleOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isNilOrError(authUser)) {
    return (
      <Container id="e2e-verification-success" className={className}>
        <ImageAvatarContainer aria-hidden>
          <img src={illustration} alt="" role="presentation" />
          <StyledAvatar userId={authUser.id} size={96} addVerificationBadge />
        </ImageAvatarContainer>
        <Title className="e2e-user-verified-success-modal-content">
          <strong>
            <FormattedMessage {...messages.userVerifiedTitle} />
          </strong>
        </Title>
        <Subtitle>
          <FormattedMessage {...messages.userVerifiedSubtitle} />
        </Subtitle>
        <ButtonWrapper>
          <Button onClick={handleOnClose}>
            <FormattedMessage {...messages.close} />
          </Button>
        </ButtonWrapper>
      </Container>
    );
  }

  return null;
});
