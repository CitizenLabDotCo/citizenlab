import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import Illustration from './Illustration';

import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  font-size: ${fontSizes.xl}px;
  line-height: ${fontSizes.xxl}px;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 100px 50px;
  ${media.smallerThanMinTablet`
    padding: 70px 30px;
  `}
  text-align: center;
`;

const StyledIllustration = styled(Illustration)`
  margin-bottom: 40px;
  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
  `}
  max-width: 100%;
  min-width: 300px;
`;

export default () => (
  <Container>
    <StyledIllustration />
    <FormattedMessage {...messages.formCompleted} />
  </Container>
);
