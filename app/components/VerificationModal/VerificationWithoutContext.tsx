import React, { memo, useMemo, useCallback } from 'react';

// components
import Icon from 'components/UI/Icon';

// i18n
import messages from './messages';
import { FormattedHTMLMessage } from 'react-intl';

// style
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  border: solid 1px red;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin: 0;
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

const StyledIcon = styled(Icon)`
  width: 48px;
  height: 53px;
  border: solid 1px red;
`;

interface Props {
  className?: string;
}

const VerificationWithoutContext = memo<Props>(({ className }) => {

  // const handleOnChange = useCallback(() => {
  // }, []);

  return (
    <Container className={className}>
      <Title>
        <FormattedHTMLMessage {...messages.verifyYourIdentity} />
      </Title>
      <StyledIcon name="shield_verification" />
    </Container>
  );
});

export default VerificationWithoutContext;
