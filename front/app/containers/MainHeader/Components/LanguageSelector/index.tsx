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
import { Locale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { shortenedAppLocalePairs } from 'containers/App/constants';

import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import { updateLocale } from 'utils/locale';

import { getSelectedLocale } from './utils';

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
  top?: string;
  mobileRight?: string;
  mobileLeft?: string;
  right?: string;
}

const LanguageSelector = ({
  className,
  top,
  mobileRight,
  mobileLeft,
  right,
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

  const handleLanguageSelect = (selectedLocale: Locale) => () => {
    if (appConfig) {
      updateLocale(selectedLocale, appConfig);
    }
    setDropdownOpened(false);
  };

  if (!isNilOrError(appConfig) && !isNilOrError(locale)) {
    const tenantLocales = appConfig.data.attributes.settings.core.locales;
    const isRtl = !!locale.startsWith('ar');

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

        <Dropdown
          width="180px"
          mobileWidth="160px"
          top={top || '68px'}
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
