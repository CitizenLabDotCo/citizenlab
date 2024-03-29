import React from 'react';

import {
  fontSizes,
  media,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import Illustration from './Illustration';
import messages from './messages';

const Container = styled.div`
  font-size: ${fontSizes.xl}px;
  line-height: ${fontSizes.xxl}px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 50px;
  ${defaultCardStyle};

  ${media.phone`
    padding: 70px 30px;
  `}
`;

const StyledIllustration = styled(Illustration)`
  max-width: 100%;
  min-width: 300px;
  margin-bottom: 40px;

  ${media.phone`
    margin-bottom: 20px;
  `}
`;

export default () => (
  <Container className="e2e-form-completed" data-testid="form-completed">
    <StyledIllustration />
    <FormattedMessage {...messages.formCompleted} />
  </Container>
);
