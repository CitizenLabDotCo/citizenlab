import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Button from 'components/UI/Button';

// hooks
import useAuthUser from 'hooks/useAuthUser';

// style
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import success from './success.jpg';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 30px;

  ${media.smallerThanMinTablet`
    padding-bottom: 20px;
  `}
`;

const ImageContainer = styled.div`
  width: 324px;
  height: 230px;
  position: relative;
  margin-bottom: 30px;
`;

export const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 0;
  margin-bottom: 35px;
  padding: 0;

  strong {
    font-weight: 600;
  }

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xl}px;
    margin-bottom: 20px;
  `}
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface Props {
  onClose: () => void;
  className?: string;
}

export default memo<Props>(({ className, onClose }) => {
  const authUser = useAuthUser();

  const handleOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isNilOrError(authUser)) {
    return (
      <Container id="e2e-signup-success-container" className={className || ''}>
        <ImageContainer aria-hidden>
          <img src={success} alt="" role="presentation" />
        </ImageContainer>
        <Title>
          <FormattedMessage {...messages.signUpSuccess} />
        </Title>
        <ButtonWrapper>
          <Button
            className="e2e-signup-success-close-button"
            onClick={handleOnClose}
          >
            <FormattedMessage {...messages.close} />
          </Button>
        </ButtonWrapper>
      </Container>
    );
  }

  return null;
});
