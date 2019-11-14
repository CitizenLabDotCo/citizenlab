import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';

export const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 300;
  line-height: 35px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 0;
  margin-bottom: 40px;
  padding: 0;

  strong {
    font-weight: 600;
  }

  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
    text-align: left;
    font-size: ${fontSizes.xl}px;
    line-height: 28px;
  `}
`;

export const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  line-height: normal;
`;
