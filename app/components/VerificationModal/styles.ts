import { fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

export const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin: 0;
  margin-bottom: 40px;
  padding: 0;

  > span {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    > strong {
      font-weight: 600;
    }
  }
`;

export const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  line-height: normal;
`;
