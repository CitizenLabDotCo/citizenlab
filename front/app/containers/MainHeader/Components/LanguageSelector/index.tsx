import React, { useState } from 'react';

import { Dropdown, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { shortenedAppLocalePairs } from 'containers/App/constants';

import {
  Container as SwitcherContainer,
  DropdownButton,
  DropdownButtonIcon,
  DropdownButtonText,
  ListItem,
  ListItemText,
} from 'components/LanguageSwitcherStyles/styles';

import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import { updateLocale } from 'utils/locale';

import { getSelectedLocale } from './utils';

const StyledDropdown = styled(Dropdown)`
  &.open-upwards {
    bottom: 100%;
    margin-bottom: 8px;
  }
`;

// The whole container is the click target here, not just the button in it.
const Container = styled(SwitcherContainer)`
  cursor: pointer;
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
          type="button"
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
                    type="button"
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
