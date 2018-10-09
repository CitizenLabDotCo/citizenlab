import React, { SFC } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { rgba } from 'polished';
import Icon, { Props as IconProps } from 'components/UI/Icon';

interface Props {
  text: JSX.Element | string;
  color: keyof typeof colors;
  icon?: IconProps['name'];
}

const Container: any = styled.div`
  min-height: 28px;
  color: ${(props: Props) => colors[props.color]};
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  line-height: ${fontSizes.xs}px;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: ${(props: Props) => rgba(colors[props.color], .15)};
  padding-left: 10px;
  padding-right: 10px;
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 15px;
  margin-right: 6px;
`;

const StatusLabel: SFC<Props>  = (props: Props) => {
  return (
    <Container color={props.color} className={props['className']}>
      {props.icon && <StyledIcon name={props.icon} />}
      {props.text}
    </Container>
  );
};

export default StatusLabel;
