import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Dropdown,
  Icon,
  colors,
  fontSizes,
  defaultStyles,
  isRtl,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import {
  WEGLOT_READY_EVENT,
  getLanguageEndonym,
  getWeglotLanguages,
  reportMissingWeglotLanguages,
} from 'utils/weglot';

import messages from './messages';

// These styles mirror MainHeader/Components/LanguageSelector on purpose: the
// two switchers must look identical side by side in the navbar. They are not
// shared, because the two change for different reasons — that one routes the
// platform locale, this one drives Weglot's client-side translation.
const DropdownButtonText = styled.span`
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

  &:hover,
  &:focus {
    ${DropdownButtonText} {
      text-decoration: underline;
    }
  }
`;

const ListItemText = styled.span`
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

const readWeglot = () => ({
  languages: getWeglotLanguages(),
  currentLang: window.Weglot?.getCurrentLang() ?? null,
});

interface Props {
  className?: string;
  // Opens the dropdown upwards, for a switcher near the bottom of the
  // viewport where a downward panel would go off-screen.
  openUpwards?: boolean;
  // Pins the switcher to a fixed corner, for pages with neither a navbar nor
  // a footer to sit in. The corner's chrome belongs to the component so that
  // it disappears along with the switcher when there is nothing to show.
  floating?: boolean;
}

const WeglotSwitcher = ({
  className,
  openUpwards = false,
  floating = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const { data: appConfiguration } = useAppConfiguration();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtlTheme = !!theme.isRtl;
  const opensUpwards = openUpwards || floating;
  const [{ languages, currentLang }, setWeglot] = useState(readWeglot);

  useEffect(() => {
    const sync = () => setWeglot(readWeglot());

    // Weglot may already be on the page (a remount), or still loading from
    // their CDN. Either way we only ever subscribe once it exists.
    const attach = () => {
      // initialize() returns before the project settings have been fetched,
      // so the languages and current language are only readable once Weglot
      // reports itself initialized.
      window.Weglot?.on('initialized', sync);
      window.Weglot?.on('languageChanged', sync);
      sync();
    };

    if (window.Weglot) {
      attach();
    } else {
      window.addEventListener(WEGLOT_READY_EVENT, attach);
    }

    return () => {
      window.removeEventListener(WEGLOT_READY_EVENT, attach);
      window.Weglot?.off('initialized', sync);
      window.Weglot?.off('languageChanged', sync);
    };
  }, []);

  const optedIn =
    appConfiguration?.data.attributes.settings.core
      .weglot_switcher_in_navbar === true;

  useEffect(() => {
    if (!optedIn) return;
    // Before Weglot initializes it has no languages yet, which is normal, and
    // a project with a source language but no enabled targets legitimately
    // offers one. Only getting nothing at all means the contract broke.
    if (!window.Weglot?.initialized || languages.length > 0) return;

    reportMissingWeglotLanguages();
  }, [optedIn, languages]);

  if (!optedIn || !currentLang || languages.length < 2) {
    return null;
  }

  const toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    setDropdownOpened((opened) => !opened);
  };

  const selectLanguage = (language: string) => () => {
    window.Weglot?.switchTo(language);
    setDropdownOpened(false);
  };

  const closeOnClickOutside = (event: React.FormEvent) => {
    // This fires on document click in the capture phase, so a click on our own
    // toggle would close the dropdown here and the toggle's own handler would
    // immediately reopen it. Clicks inside the switcher close it themselves.
    if (containerRef.current?.contains(event.target as Node)) return;
    setDropdownOpened(false);
  };

  const switcher = (
    // Weglot translates the page it is embedded in, so its own language names
    // must be left alone.
    <Container
      ref={containerRef}
      className={className}
      data-wg-notranslate
      onMouseDown={removeFocusAfterMouseClick}
    >
      <DropdownButton
        type="button"
        onClick={toggleDropdown}
        aria-expanded={dropdownOpened}
        aria-label={formatMessage(messages.ariaLabel)}
      >
        <DropdownButtonText>
          {getLanguageEndonym(currentLang)}
        </DropdownButtonText>
        <DropdownButtonIcon
          fill={theme.navbarTextColor || theme.colors.tenantText}
          name="chevron-down"
        />
      </DropdownButton>

      <Dropdown
        width="180px"
        mobileWidth="160px"
        top={opensUpwards ? undefined : '68px'}
        bottom={opensUpwards ? 'calc(100% + 8px)' : undefined}
        // Dropdown mirrors left/right under RTL, which is what the navbar
        // wants. The phone block below it does not, so those two are mirrored
        // here instead.
        left={opensUpwards ? '0px' : undefined}
        right={opensUpwards ? undefined : '0px'}
        mobileLeft={opensUpwards && !isRtlTheme ? '0px' : undefined}
        mobileRight={opensUpwards ? (isRtlTheme ? '0px' : undefined) : '5px'}
        opened={dropdownOpened}
        onClickOutside={closeOnClickOutside}
        content={
          <Box>
            {languages.map((language, index) => (
              <ListItem
                type="button"
                key={language}
                lang={language}
                onClick={selectLanguage(language)}
                className={`${language === currentLang ? 'active' : ''} ${
                  index === languages.length - 1 ? 'last' : ''
                }`}
              >
                <ListItemText>{getLanguageEndonym(language)}</ListItemText>
              </ListItem>
            ))}
          </Box>
        }
      />
    </Container>
  );

  if (!floating) return switcher;

  return (
    <Box
      position="fixed"
      bottom="20px"
      left={isRtlTheme ? undefined : '20px'}
      right={isRtlTheme ? '20px' : undefined}
      zIndex="1000"
      bgColor={colors.white}
      px="12px"
      py="8px"
      borderRadius={stylingConsts.borderRadius}
      boxShadow={defaultStyles.boxShadowHoverBig}
    >
      {switcher}
    </Box>
  );
};

export default WeglotSwitcher;
