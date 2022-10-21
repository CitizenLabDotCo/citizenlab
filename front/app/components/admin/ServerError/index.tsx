import React, { memo } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import messages from './messages';

const Container = styled.div`
  color: ${colors.red600};
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
