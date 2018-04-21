import React from 'react';

import styled from 'styled-components';
import { fontSize, colors } from 'utils/styleUtils';
import { rgba } from 'polished';

export interface Props {
  color: keyof typeof colors;
}

const StatusLabel = styled.span`
  background: ${(props: Props) => rgba(colors[props.color], .15)};
  border-radius: 5px;
  color: ${(props: Props) => colors[props.color]};
  display: inline-block;
  font-size: ${fontSize('xs')};
  line-height: 1;
  margin: .5em;
  padding: calc(1em/3) .75em;
  text-transform: uppercase;
`;

export default (props: Props) => <StatusLabel {...props} />;
