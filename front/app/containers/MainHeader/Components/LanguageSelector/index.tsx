import React, { useState } from 'react';

import {
  Icon,
  Dropdown,
  useBreakpoint,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { shortenedAppLocalePairs } from 'containers/App/constants';

import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import { updateLocale } from 'utils/locale';

import { getSelectedLocale } from './utils';

const StyledDropdown = styled(Dropdown)`
  &.open-upwards {
    bottom: 100%;
    margin-bottom: 8px;
  }
`;

const DropdownButtonText = styled.div`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  transition: all 100ms ease-out;
`;

const DropdownButtonIcon = styled(Icon)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
  transition: all 100ms ease-out;
  ${isRtl`
    margin-left: 0;
    margin-right: 4px;
  `}
`;

const DropdownButton = styled.button`
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  &:hover,
  &:focus {
    ${DropdownButtonText} {
      text-decoration: underline;
    }
  }
`;

const ListItemText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
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
      color: #000;
    }
  }
`;

interface Props {
  className?: string;
  dropdownClassName?: string;
  top?: string;
  useDefaultTop?: boolean;
  mobileRight?: string;
  mobileLeft?: string;
  right?: string;
  afterSelection?: () => void;
}

const LanguageSelector = ({
  className,
  dropdownClassName,
  top,
  mobileRight,
  useDefaultTop = true,
  mobileLeft,
  right,
  afterSelection,
}: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const isPhoneOrSmaller = useBreakpoint('phone');
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();
  const theme = useTheme();

  const toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    setDropdownOpened((dropdownOpened) => !dropdownOpened);
  };

  const handleLanguageSelect = (selectedLocale: SupportedLocale) => () => {
    if (appConfig) {
      updateLocale(selectedLocale, appConfig);
      afterSelection && afterSelection();
    }
    setDropdownOpened(false);
  };

  if (!isNilOrError(appConfig) && !isNilOrError(locale)) {
    const tenantLocales = appConfig.data.attributes.settings.core.locales;
    const isRtl = !!locale.startsWith('ar');

    // Check if the number of locales is only one and hide if there is only one since there are no langauges to select
    if (tenantLocales.length === 1) {
      return null;
    }

    const selectedLocale = getSelectedLocale(locale);

    return (
      <Container
        className={className}
        onMouseDown={removeFocusAfterMouseClick}
        onClick={toggleDropdown}
        style={{ marginLeft: isPhoneOrSmaller || isRtl ? '16px' : undefined }}
      >
        <DropdownButton
          className="e2e-language-dropdown-toggle"
          aria-expanded={dropdownOpened}
        >
          <DropdownButtonText>{selectedLocale}</DropdownButtonText>
          <DropdownButtonIcon
            fill={theme.navbarTextColor || theme.colors.tenantText}
            name="chevron-down"
          />
        </DropdownButton>

        <StyledDropdown
          className={dropdownClassName}
          width="180px"
          mobileWidth="160px"
          top={useDefaultTop ? top || '68px' : top || undefined}
          right={right ? right : !isRtl ? '0px' : undefined}
          mobileRight={mobileRight ? mobileRight : !isRtl ? '5px' : undefined}
          mobileLeft={mobileLeft ? mobileLeft : isRtl ? '5px' : undefined}
          opened={dropdownOpened}
          onClickOutside={toggleDropdown}
          content={
            <>
              {tenantLocales.map((tenantLocale, index) => {
                const last = index === tenantLocales.length - 1;

                return (
                  <ListItem
                    key={tenantLocale}
                    onClick={handleLanguageSelect(tenantLocale)}
                    className={`e2e-langage-${tenantLocale} ${
                      tenantLocale === locale ? 'active' : ''
                    } ${last ? 'last' : ''}`}
                    lang={tenantLocale}
                  >
                    <ListItemText>
                      {shortenedAppLocalePairs[tenantLocale]}
                    </ListItemText>
                  </ListItem>
                );
              })}
            </>
          }
        />
      </Container>
    );
  }

  return null;
};

export default LanguageSelector;
