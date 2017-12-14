import * as React from 'react';
import * as _ from 'lodash';

// style
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
`;

interface IStyledSpinner {
  size: string;
  thickness: string;
  color: string;
}

const StyledSpinner: any = styled.div`
  width: ${(props: IStyledSpinner) => props.size};
  height: ${(props: IStyledSpinner) => props.size};
  animation: ${rotate} 800ms infinite linear;
  border-style: solid;
  border-right-color: transparent !important;
  border-width: ${(props: IStyledSpinner) => props.thickness};
  border-color: ${(props: IStyledSpinner) => props.color};
  border-radius: 50%;
  padding: 0;
  margin: 0;
`;

type Props = {
  size?: string;
  thickness?: string;
  color?: string;
};

export default class Spinner extends React.PureComponent<Props, {}> {
  render() {
    const className = this.props['className'];
    let { size, thickness, color } = this.props;

    size = (size || '26px');
    thickness = (thickness || '3px');
    color = (color || '#fff');

    return (
      <StyledSpinner className={className} size={size} thickness={thickness} color={color} />
    );
  }
}
