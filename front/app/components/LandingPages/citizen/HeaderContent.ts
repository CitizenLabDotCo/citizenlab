import { fontSizes, media, Title } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

export type TAlign = 'center' | 'left';
export const getAlignItems = (align: TAlign) => {
  if (align === 'center') return 'center';
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 'bold'};
  line-height: normal;
`;

export const HeaderTitle = styled(Title)<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) => {
    return hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colors.tenantPrimary
      : theme.colors.tenantPrimary;
  }};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxl}px;
  ${HeadingFontStyle};
  text-align: ${({ align }) => align};
  padding: 0;
  margin: 0;
  margin-bottom: 10px;

  ${media.phone`
    font-size: ${fontSizes.xl}px;
    margin-bottom: 12px;
  `}
`;

export const HeaderSubtitle = styled(Title)<{
  hasHeader: boolean;
  fontColors: 'light' | 'dark';
  align: 'center' | 'left';
  displayHeaderAvatars?: boolean;
}>`
  width: 100%;
  color: ${({ hasHeader, fontColors, theme }) =>
    hasHeader
      ? fontColors === 'light'
        ? '#fff'
        : theme.colors.tenantPrimary
      : theme.colors.tenantPrimary};
  font-size: ${fontSizes.l}px;
  text-align: ${({ align }) => align};
  text-decoration: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;

  ${media.phone`
    font-size: ${fontSizes.m}px;
    margin-bottom: 12px;
    line-height: normal;
  `}

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
