import React from 'react';
import styled from 'styled-components';

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 50em;
  background: #fff;
  padding: 40px;
  border: 1px solid #ddd;
  box-shadow: 0 0 1px #ddd;
  border-radius: ${(props: any) => props.theme.borderRadius};
  margin: 0 auto 30px;
`;

export default ({ children }) => (
  <StyledContentContainer>
    {children}
  </StyledContentContainer>
);
