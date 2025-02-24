import styled from 'styled-components';

export const StyledImg = styled.img`
  padding: 4px;
  border: 3px solid white;
  border-radius: 4px;
  height: 50px;

  &.anotherValueSelected {
    filter: grayscale(1);
    opacity: 0.8;
  }

  &.isSelected {
    border: 3px solid ${({ theme }) => theme.colors.coolGrey600};
  }

  &:hover {
    border: 3px solid ${({ theme }) => theme.colors.coolGrey600};
  }
`;
