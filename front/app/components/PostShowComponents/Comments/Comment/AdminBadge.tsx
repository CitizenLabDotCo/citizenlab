import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.span`
  color: ${colors.red600};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props) => props.theme.borderRadius};
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background: ${lighten(0.52, colors.red600)};
  border: none;
  padding: 4px 8px;
  height: 24px;
  display: flex;
  align-items: center;
`;

interface Props {
  className?: string;
}

export default (props: Props) => (
  <Container className={props.className}>
    <FormattedMessage {...messages.official} />
  </Container>
);
