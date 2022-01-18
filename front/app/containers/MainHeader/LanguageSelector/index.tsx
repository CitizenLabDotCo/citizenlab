import React, { useState } from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// components
import { Icon, Dropdown } from '@citizenlab/cl2-component-library';

// services
import { updateLocale } from 'services/locale';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'containers/App/constants';

// typings
import { Locale } from 'typings';

const DropdownButtonText = styled.div`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  transition: all 100ms ease-out;
`;

const DropdownButtonIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  margin-top: 1px;
  margin-left: 4px;
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
  color: ${colors.label};
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
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.active {
    background: ${colors.clDropdownHoverBackground};
    ${ListItemText} {
      color: #000;
    }
  }
`;

interface Props {
  className?: string;
}

const LanguageSelector = ({ className }: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  const toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    setDropdownOpened((dropdownOpened) => !dropdownOpened);
  };

  const handleLanguageSelect = (selectedLocale: Locale) => () => {
    updateLocale(selectedLocale);
    setDropdownOpened(false);
  };

  const getSelectedLocale = (locale: Locale) => {
    if (locale === 'sr-SP') {
      return 'CP';
    } else {
      return locale.substr(0, 2).toUpperCase();
    }
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
      >
        <DropdownButton
          className="e2e-langage-dropdown-toggle"
          aria-expanded={dropdownOpened}
        >
          <DropdownButtonText>{selectedLocale}</DropdownButtonText>
          <DropdownButtonIcon name="dropdown" />
        </DropdownButton>

        <Dropdown
          width="180px"
          top="68px"
          right={!isRtl ? '0px' : undefined}
          left={isRtl ? '0px' : undefined}
          mobileRight={!isRtl ? '5px' : undefined}
          mobileLeft={isRtl ? '5px' : undefined}
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
