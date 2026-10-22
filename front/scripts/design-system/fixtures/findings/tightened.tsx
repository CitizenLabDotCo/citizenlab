import styled from 'styled-components';

// Not imported from the component library, so not a legacy read.
const colors = ['a', 'b'];
export const names = colors.map((c) => c);

export const T = styled.div`
  background: url(/img/red.png);
  background-image: url("https://cdn.example.com/blue-12px.png");
  // padding: 20px;
  /* margin: 30px */
  content: 'red';
  color: ${({ theme }) => theme?.colors?.main};
  width: ${(props) => props.theme.colors.grey};
`;
