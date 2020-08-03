import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import Illustration from './Illustration';
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  font-size: ${fontSizes.xl}px;
  line-height: ${fontSizes.xxl}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 50px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3),
    0px 1px 5px -2px rgba(152, 162, 179, 0.3);

  ${media.smallerThanMinTablet`
    padding: 70px 30px;
  `}
`;

const StyledIllustration = styled(Illustration)`
  max-width: 100%;
  min-width: 300px;
  margin-bottom: 40px;

  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
  `}
`;

export default () => (
  <Container className="e2e-form-completed">
    <StyledIllustration />
    <FormattedMessage {...messages.formCompleted} />
  </Container>
);
