import React, { useEffect, useState } from 'react';

import {
  Icon,
  useBreakpoint,
  media,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { MessageDescriptor } from 'react-intl';
import styled, { css } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { TPolicyPage } from 'api/custom_pages/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  ${media.tablet`
    margin-top: 0px;
  `}
`;

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  padding-top: 11px;
  padding-bottom: 11px;
  background: #fff;
  border-top: solid 1px #ccc;
  overflow: hidden;

  ${media.tablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 10px;
    background: #f4f4f4;
  `}
`;

const PagesNav = styled.nav`
  ${media.tablet`
    width: 90vw;
    margin-top: 15px;
    margin-bottom: 15px;
  `}
`;

const PagesNavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  ${media.tablet`
    flex-wrap: wrap;
    justify-content: center;
  `}
  & li {
    margin-right: 10px;
    &:after {
      color: ${colors.textSecondary};
      font-size: ${fontSizes.s}px;
      font-weight: 400;
      content: '•';
      margin-left: 10px;
    }
    &:last-child {
      margin-right: 0px;
      &:after {
        margin-left: 0px;
        content: '';
      }
    }
  }
`;

const PagesNavListItem = styled.li`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  hyphens: auto;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const linkStyle = css`
  color: ${colors.textSecondary};
  font-weight: 400;
  font-size: ${fontSizes.s}px;
  line-height: 21px;
  text-decoration: none;
  hyphens: auto;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const StyledLink = styled(Link)`
  ${linkStyle}
`;

const StyledA = styled.a`
  ${linkStyle}
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  ${media.tablet`
    margin-top: 15px;
    margin-bottom: 15px;
  `}
  ${media.tablet`
    flex-direction: column;
  `}
`;

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  outline: none;
  ${media.tablet`
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    margin-bottom: 15px;
    border: none;
  `}
`;

const PoweredByText = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  margin-right: 8px;
  ${media.tablet`
    display: none;
    margin-bottom: 10px;
  `}
`;

const GoVocalLink = styled.a`
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  cursor: pointer;
`;

const GoVocalLogo = styled(Icon)`
  height: 32px;
  fill: ${colors.textSecondary};
  &:hover {
    fill: #000;
  }
`;

interface Props {
  className?: string;
}

// Hard-coded in front-end, not possible to edit
type THardcodedPage = 'cookie-policy' | 'accessibility-statement';

type TFooterPage = TPolicyPage | THardcodedPage;

const FOOTER_PAGES: TFooterPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'accessibility-statement',
];

const MESSAGES_MAP: { [key in TFooterPage]: MessageDescriptor } = {
  'terms-and-conditions': messages.termsAndConditions,
  'privacy-policy': messages.privacyPolicy,
  'cookie-policy': messages.cookiePolicy,
  'accessibility-statement': messages.accessibilityStatement,
};

const PlatformFooter = ({ className }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const isTabletOrSmaller = useBreakpoint('tablet');
  const { data: appConfiguration } = useAppConfiguration();
  const customizedA11yHrefEnabled = useFeatureFlag({
    name: 'custom_accessibility_statement_link',
  });
  const [paddingBottom, setPaddingBottom] = useState<string | undefined>(
    undefined
  );

  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  /* 
    Likely not the most reliable way to determine if the bar is present.
    Context would probably be better, but this is a quick fix.
  */
  const participationBar = document.getElementById('project-cta-bar-bottom');

  useEffect(() => {
    setPaddingBottom(
      participationBar && isTabletOrSmaller
        ? `${participationBar.offsetHeight}px`
        : undefined
    );
  }, [participationBar, isTabletOrSmaller]);

  const getHasCustomizedA11yFooterLink = () => {
    return (
      !isNilOrError(appConfiguration) &&
      customizedA11yHrefEnabled &&
      !isEmpty(
        appConfiguration.data.attributes.settings
          .custom_accessibility_statement_link.url
      )
    );
  };

  const getCustomizedA11yHref = () => {
    if (isNilOrError(appConfiguration) || !getHasCustomizedA11yFooterLink()) {
      return null;
    }

    return appConfiguration.data.attributes.settings
      .custom_accessibility_statement_link.url;
  };

  const hasCustomizedA11yFooterLink = getHasCustomizedA11yFooterLink();
  const customizedA11yHref = getCustomizedA11yHref();
  const removeVendorBranding = useFeatureFlag({
    name: 'remove_vendor_branding',
  });

  const getLocalizedLogoName = () => {
    switch (locale) {
      case 'es-CL':
      case 'es-ES':
      case 'ca-ES':
        return 'gv-logo-es';
      case 'nl-NL':
      case 'nl-BE':
        return 'gv-logo-nl';
      case 'fr-FR':
      case 'fr-BE':
        return 'gv-logo-fr';
      case 'da-DK':
        return 'gv-logo-dk';
      case 'de-DE':
        return 'gv-logo-de';
      default:
        return 'gv-logo-en'; // Default is English
    }
  };

  return (
    <Container id="hook-footer" className={className}>
      <FooterContainer style={{ paddingBottom }}>
        <PagesNav aria-label={formatMessage(messages.ariaLabel)}>
          <PagesNavList>
            {FOOTER_PAGES.map((slug: TFooterPage, index) => {
              return (
                <React.Fragment key={slug}>
                  <PagesNavListItem>
                    {slug === 'accessibility-statement' &&
                    hasCustomizedA11yFooterLink &&
                    customizedA11yHref ? (
                      <StyledA
                        href={customizedA11yHref}
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        target={hasCustomizedA11yFooterLink && '_blank'}
                        className={index === 0 ? 'first' : ''}
                      >
                        <FormattedMessage {...MESSAGES_MAP[slug]} />
                      </StyledA>
                    ) : (
                      <StyledLink
                        to={`/pages/${slug}`}
                        className={index === 0 ? 'first' : ''}
                      >
                        <FormattedMessage {...MESSAGES_MAP[slug]} />
                      </StyledLink>
                    )}
                  </PagesNavListItem>
                </React.Fragment>
              );
            })}
            <PagesNavListItem>
              <StyledButton onClick={openConsentManager}>
                <FormattedMessage {...messages.cookieSettings} />
              </StyledButton>
            </PagesNavListItem>
            <PagesNavListItem>
              <StyledLink to="/site-map" id="site-map-link">
                <FormattedMessage {...messages.siteMap} />
              </StyledLink>
            </PagesNavListItem>
          </PagesNavList>
        </PagesNav>

        {!removeVendorBranding && (
          <Right>
            <PoweredBy>
              <PoweredByText>
                <FormattedMessage {...messages.poweredBy} />
              </PoweredByText>
              <GoVocalLink href="https://govocal.com/" target="_blank">
                <GoVocalLogo
                  ariaHidden={false}
                  name={getLocalizedLogoName()}
                  title="Go Vocal"
                />
              </GoVocalLink>
            </PoweredBy>
          </Right>
        )}
      </FooterContainer>
    </Container>
  );
};

export default PlatformFooter;
