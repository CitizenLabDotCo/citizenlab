import styled from 'styled-components';

export const ColorIndicator = styled.div`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) => props.color};
  border-radius: ${(props) => props.theme.borderRadius};
  margin-right: 0.5rem;
  margin-top: auto;
  margin-bottom: auto;
`;
