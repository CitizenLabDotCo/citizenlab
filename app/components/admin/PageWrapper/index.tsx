// Libraries
import * as React from 'react';

// Style
import styled from 'styled-components';

const Wrapper = styled.div`
  background: #fff;
  border-radius: 5px;
  border: 1px solid ${(props) => props.theme.colors.separation};
  box-sizing: border-box;
  padding: 3.5rem 4rem;
  margin-bottom: 60px;
`;

export default class PageWrapper extends React.PureComponent{
  render() {
    return (
      <Wrapper>{this.props.children}</Wrapper>
    );
  }
}

export const ButtonWrapper = styled.div`
  display: flex;
  margin: 2em 0;
  padding: 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
