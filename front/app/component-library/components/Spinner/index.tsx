import React, { PureComponent } from 'react';

import styled, { css, keyframes } from 'styled-components';

import testEnv from '../../utils/testUtils/testEnv';

const rotate = keyframes`
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
`;

const Container = styled.span`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const StyledSpinner = styled.span<{
  size: string;
  thickness: string;
  color: string;
}>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  animation: ${css`
    ${rotate} 800ms infinite linear
  `};
  border-style: solid;
  border-right-color: transparent !important;
  border-width: ${(props) => props.thickness};
  border-color: ${(props) => props.color};
  border-radius: 50%;
  padding: 0;
  margin: 0;
`;

interface DefaultProps {
  size: string;
  thickness: string;
  color: string;
}

interface Props extends DefaultProps {
  className?: string;
}

class Spinner extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '32px',
    thickness: '3px',
    color: '#666',
  };

  render() {
    const { size, thickness, color, className } = this.props;

    return (
      <Container className={className}>
        <StyledSpinner
          className="spinner"
          size={size}
          thickness={thickness}
          color={color}
          data-testid={testEnv('spinner')}
        />
      </Container>
    );
  }
}

export default Spinner;
