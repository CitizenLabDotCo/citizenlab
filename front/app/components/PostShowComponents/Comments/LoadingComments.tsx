import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingMessage = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.m}px;
  font-weight: 400;
`;

interface Props {
  className?: string;
}

export default (props: Props) => (
  <Container className={props.className}>
    <LoadingMessage>
      <FormattedMessage {...messages.loadingComments} />
    </LoadingMessage>
  </Container>
);
