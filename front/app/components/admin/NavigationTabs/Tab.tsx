// style
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from './tabsStyleConstants';

export const darkSkyBlue = '#7FBBCA'; // TODO: Use color from component library.

const Tab = styled.div`
  ${({ active }: TabProps) => css`
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: calc(${tabBorderSize}px * -1);
    border-bottom: ${activeBorderSize}px solid transparent;

    &:first-letter {
      text-transform: uppercase;
    }

    &:not(:last-child) {
      margin-right: 40px;
    }

    > * {
      color: ${colors.textSecondary};
      font-size: ${fontSizes.base}px;
      font-weight: 400;
      line-height: ${tabLineHeight}px;
      padding: 0;
      padding-top: ${tabPadding}px;
      padding-bottom: ${tabPadding}px;
      transition: all 100ms ease-out;
    }

    &:hover > * {
      color: ${colors.primary};
    }

    ${!active &&
    `&:hover {
      border-color: #ddd;
    }`}

    ${active &&
    `border-color: ${darkSkyBlue};
    // border-color: ${colors.primary}; TODO : set accent color in component library

    > * {
        color: ${colors.primary};
    }`}
  `}
`;

type TabProps = { active: boolean } & React.HTMLAttributes<HTMLDivElement>;

export default Tab;
