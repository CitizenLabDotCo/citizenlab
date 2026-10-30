import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Dropdown,
  colors,
  defaultStyles,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import {
  Container,
  DropdownButton,
  DropdownButtonIcon,
  DropdownButtonText,
  ListItem,
  ListItemText,
} from 'components/LanguageSwitcherStyles/styles';

import { useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';
import {
  WEGLOT_READY_EVENT,
  getLanguageEndonym,
  getWeglotLanguages,
  reportMissingWeglotLanguages,
} from 'utils/weglot';

import messages from './messages';

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
        // An aria-label replaces the button's visible text, so the current
        // language has to be named here or screen readers never announce it.
        aria-label={formatMessage(messages.ariaLabel, {
          language: getLanguageEndonym(currentLang),
        })}
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
