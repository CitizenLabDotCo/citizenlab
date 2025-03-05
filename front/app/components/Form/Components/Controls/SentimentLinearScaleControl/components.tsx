import styled from 'styled-components';

export const StyledImg = styled.img`
  padding: 8px;
  border: 1px solid white;
  border-radius: 8px;
  width: 48px;

  &.isSelected {
    border: 1px solid ${({ theme }) => theme.colors.tenantPrimary};
    background-color: ${({ theme }) => theme.colors.tenantPrimaryLighten90};
  }

  &:not(.isSelected):hover {
    background-color: ${({ theme }) => theme.colors.grey100};
    border: 1px solid ${({ theme }) => theme.colors.grey500};
  }
`;
