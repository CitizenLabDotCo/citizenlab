import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedHTMLMessage } from 'react-intl';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AboveTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  background: #fff;
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

const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin: 0;
  margin-bottom: 40px;
  padding: 0;

  > span {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    > strong {
      font-weight: 600;
    }
  }

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const ButtonsContainer = styled.div`
  width: 100%;
  max-width: 420px;
  padding-left: 40px;
  padding-right: 40px;
  padding-top: 32px;
  padding-bottom: 32px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

interface Props {
  className?: string;
}

const VerificationWithContext = memo<Props>(({ className }) => {

  const authUser = useAuthUser();

  const onVerifyManuallyButtonClick = useCallback(() => {
    // empty
  }, []);

  const onClose = useCallback(() => {
    // empty
  }, []);

  return (
    <Modal
      width="820px"
      opened={true}
      close={onClose}
    >
      <Container className={className}>
        <AboveTitle>
          <StyledAvatar userId={!isNilOrError(authUser) ? authUser.data.id : null} size="55px" />
          <ShieldIcon name="shield_verification" />
        </AboveTitle>
        <Title>
          <FormattedHTMLMessage {...messages.verifyYourIdentityWithoutContext} />
        </Title>
        <ButtonsContainer>
          <Button
            icon="verify_manually"
            onClick={onVerifyManuallyButtonClick}
            fullWidth={true}
            size="2"
            justify="left"
            padding="20px 20px"
            bgColor="#fff"
            bgHoverColor="#fff"
            textColor={colors.text}
            textHoverColor={darken(0.2, colors.text)}
            borderColor="#e3e3e3"
            borderHoverColor={darken(0.2, '#e3e3e3')}
            boxShadow="0px 2px 2px rgba(0, 0, 0, 0.05)"
            boxShadowHover="0px 2px 2px rgba(0, 0, 0, 0.1)"
          >
            <FormattedMessage {...messages.verifyManually}/>
          </Button>
        </ButtonsContainer>
      </Container>
    </Modal>
  );
});

export default VerificationWithContext;
