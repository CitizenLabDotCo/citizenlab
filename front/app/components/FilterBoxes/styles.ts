import { fontSizes, isRtl } from 'utils/styleUtils';
import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: 18px;
  margin-right: 22px;

  ${isRtl`
    margin-left: auto;
  `}
`;

export const Title = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: 15px;
`;
