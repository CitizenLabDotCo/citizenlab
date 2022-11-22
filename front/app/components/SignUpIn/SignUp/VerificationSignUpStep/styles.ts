import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

export const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 0;
  margin-bottom: 35px;
  padding: 0;

  strong {
    font-weight: 600;
  }

  ${media.tablet`
    font-size: ${fontSizes.xl}px;
    margin-bottom: 20px;
  `}
`;

export const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.l}px;
  font-weight: 600;
  line-height: normal;
`;
