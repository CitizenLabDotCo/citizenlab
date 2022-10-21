import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import messages from './messages';

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
