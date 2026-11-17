/**
 * Shared look of the platform's language controls: the locale selector
 * (MainHeader/Components/LanguageSelector) and the Weglot switcher
 * (components/WeglotSwitcher).
 *
 * The two behave differently. One routes the platform locale, the other
 * drives Weglot's client-side translation. They look alike everywhere they
 * appear though: the navigation bar, the survey form footer, and floating on
 * pages with neither. Restyling one means restyling both.
 */
import {
  Icon,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export const DropdownButtonText = styled.span`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  transition: all 100ms ease-out;
`;

export const DropdownButtonIcon = styled(Icon)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  transition: all 100ms ease-out;
  ${isRtl`
    margin-left: 0;
    margin-right: 4px;
  `}
`;

export const DropdownButton = styled.button`
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

export const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;

  &:hover,
  &:focus {
    ${DropdownButtonText} {
      text-decoration: underline;
    }
  }
`;

export const ListItemText = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

export const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: ${colors.white};
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.active {
    background: ${colors.grey300};
    ${ListItemText} {
      color: ${colors.black};
    }
  }
`;
