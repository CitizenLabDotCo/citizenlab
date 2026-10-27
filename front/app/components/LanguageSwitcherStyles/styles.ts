import {
  Icon,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

/**
 * How a language control looks in the navigation bar. Shared by the
 * platform-locale selector (MainHeader/Components/LanguageSelector) and the
 * Weglot switcher (components/WeglotSwitcher).
 *
 * The two behave differently: one routes the platform locale, the other
 * drives Weglot's client-side translation. Their appearance is the same
 * thing though. Both take the navbar's text colour, font size and reading
 * direction, so restyling one means restyling the other.
 */

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
