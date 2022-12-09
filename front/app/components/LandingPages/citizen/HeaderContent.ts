import styled, { css } from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

export type TAlign = 'center' | 'left';
export const getAlignItems = (align: TAlign) => {
  if (align === 'center') return 'center';
  if (align === 'left') return 'flex-start';

  return undefined;
};
export const Container = styled.div<{
  align: 'center' | 'left';
  alignTo: 'center' | 'flex-start' | undefined;
}>`
  height: 100%;
  max-width: ${({ theme }) => theme.maxPageWidth + 60}px;
  padding: ${({ align }) => (align === 'left' ? '50px 80px' : '50px 30px')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${({ alignTo }) => alignTo || 'normal'};
  z-index: 1;
  box-sizing: content-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.tablet`
    padding: 50px 30px;
  `}
`;

export const HeadingFontStyle = css`
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
`;

export const HeaderTitle = styled.h1<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colors.tenantPrimary
      : theme.colors.tenantPrimary};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxl}px;
  ${HeadingFontStyle};
  text-align: ${({ align }) => align};
  padding: 0;
  margin-bottom: 10px;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${media.phone`
    margin-bottom: 15px;
  `}
`;

export const HeaderSubtitle = styled.h2<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
  displayHeaderAvatars: boolean;
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colors.tenantPrimary
      : theme.colors.tenantPrimary};
  font-size: ${fontSizes.l}px;
  line-height: 28px;
  font-weight: 400;
  text-align: ${({ align }) => align};
  text-decoration: none;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;

  ${({ displayHeaderAvatars }) =>
    // needed because we don't always
    // show avatars
    !displayHeaderAvatars &&
    `
      margin-bottom: 38px;

      ${media.phone`
        margin-bottom: 30px;
      `}
  `}
`;
