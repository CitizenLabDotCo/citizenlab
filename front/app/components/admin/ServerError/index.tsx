import React, { memo } from 'react';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  color: ${colors.clRedError};
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ServerError = memo(() => (
  <Container>
    <FormattedMessage {...messages.genericServerError} />
  </Container>
));

export default ServerError;
