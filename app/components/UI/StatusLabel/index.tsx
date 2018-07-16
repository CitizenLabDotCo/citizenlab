import React, { SFC } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { rgba } from 'polished';

interface Props {
  color: keyof typeof colors;
}

const StyledStatusLabel = styled.span`
  background: ${(props: Props) => rgba(colors[props.color], .15)};
  border-radius: 5px;
  color: ${(props: Props) => colors[props.color]};
  display: inline-flex;
  align-items: center;
  font-size: ${fontSizes.xs}px;
  line-height: ${fontSizes.xs}px;
  padding: 5px;
  margin-left: 10px;
  text-transform: uppercase;
`;

const StatusLabel: SFC<Props>  = (props: Props) => <StyledStatusLabel {...props} />;

export default StatusLabel;
