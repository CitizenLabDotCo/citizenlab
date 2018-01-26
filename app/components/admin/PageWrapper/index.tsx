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

export default class PageWrapper extends React.Component{
  render() {
    return (
      <Wrapper>{this.props.children}</Wrapper>
    );
  }
}
