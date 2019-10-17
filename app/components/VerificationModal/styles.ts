import { fontSizes, media } from 'utils/styleUtils';
import styled from 'styled-components';

export const Title = styled.h3`
  width: 100%;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
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

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;
