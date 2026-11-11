import { bo, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const MenuRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border: 0;
  border-radius: ${bo.borderRadius};
  background: none;
  font-family: inherit;
  font-size: ${fontSizes.s}px;
  text-align: left;
  color: ${bo.colors.textHeadingStrong};
  cursor: pointer;

  &:hover,
  &[data-active='true'] {
    background: ${colors.grey100};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.tenantPrimary};
    outline-offset: -2px;
  }

  &[data-compact='true'] {
    align-items: center;
    min-height: 32px;
    padding: 0 8px;
  }

  &[data-hide-unchecked='true']:not(:hover):not(:focus-visible)
    [data-unchecked='true'] {
    visibility: hidden;
  }
`;

export default MenuRow;
