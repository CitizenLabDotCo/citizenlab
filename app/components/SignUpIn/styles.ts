import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-bottom: solid 1px ${colors.separation};
  background: #fff;
`;

export const HeaderTitle = styled.h1`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  padding: 0;
`;

export const HeaderSubtitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  padding: 0;
`;

export const Content = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const Option = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;

  & .link {
    color: ${colors.text};
    font-size: ${fontSizes.base}px;
    font-weight: 500;
    line-height: normal;
    text-decoration: underline;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
`;
