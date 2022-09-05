// style
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from './tabsStyleConstants';

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
      color: ${colors.label};
      font-size: ${fontSizes.base}px;
      font-weight: 400;
      line-height: ${tabLineHeight}px;
      padding: 0;
      padding-top: ${tabPadding}px;
      padding-bottom: ${tabPadding}px;
      transition: all 100ms ease-out;
    }

    &:hover > * {
      color: ${colors.adminTextColor};
    }

    ${!active &&
    `&:hover {
      border-color: #ddd;
    }`}

    ${active &&
    `border-color: #7FBBCA;
    // border-color: ${colors.adminTextColor}; TODO : set accent color in component library

    > * {
        color: ${colors.adminTextColor};
    }`}
  `}
`;

type TabProps = { active: boolean } & React.HTMLAttributes<HTMLDivElement>;

export default Tab;
