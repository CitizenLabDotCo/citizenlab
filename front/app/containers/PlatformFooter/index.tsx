import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// utils
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';

// components
import SendFeedback from 'components/SendFeedback';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, MessageDescriptor, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// services
import { FOOTER_PAGES, TFooterPage } from 'services/pages';

// style
import styled, { css } from 'styled-components';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

const Container = styled.footer<{ insideModal?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    padding-bottom: ${({ insideModal, theme: { mobileMenuHeight } }) =>
      insideModal ? 0 : mobileMenuHeight}px;
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
  ${media.smallerThanMaxTablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 10px;
    background: #f4f4f4;
  `}
`;

const PagesNav = styled.nav`
  ${media.smallerThanMaxTablet`
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
  ${media.smallerThanMaxTablet`
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
  ${media.smallerThanMaxTablet`
    margin-top: 15px;
    margin-bottom: 15px;
  `}
  ${media.phone`
    flex-direction: column;
  `}
`;

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  outline: none;
  padding-right: 20px;
  margin-right: 24px;
  border-right: 2px solid ${colors.separation};
  ${media.phone`
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
  `}
  ${media.smallerThanMaxTablet`
    display: block;
  `}
  ${media.phone`
    margin-bottom: 10px;
  `}
`;

const CitizenlabLink = styled.a`
  width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  cursor: pointer;
`;

const StyledSendFeedback = styled(SendFeedback)`
  ${media.phone`
    margin-top: 20px;
  `}
`;

const CitizenLabLogo = styled(Icon)`
  height: 28px;
  fill: ${colors.textSecondary};
  &:hover {
    fill: #000;
  }
`;

interface Props {
  className?: string;
  insideModal?: boolean;
}

type TMessagesMap = { [key in TFooterPage]: MessageDescriptor };

const MESSAGES_MAP: TMessagesMap = {
  'terms-and-conditions': messages.termsAndConditions,
  'privacy-policy': messages.privacyPolicy,
  'cookie-policy': messages.cookiePolicy,
  'accessibility-statement': messages.accessibilityStatement,
};

const PlatformFooter = ({
  className,
  insideModal,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();
  const windowSize = useWindowSize();
  const customizedA11yHrefEnabled = useFeatureFlag({
    name: 'custom_accessibility_statement_link',
  });

  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  const getHasCustomizedA11yFooterLink = () => {
    return (
      !isNilOrError(appConfiguration) &&
      customizedA11yHrefEnabled &&
      !isEmpty(
        appConfiguration.attributes.settings.custom_accessibility_statement_link
          .url
      )
    );
  };

  const getCustomizedA11yHref = () => {
    if (isNilOrError(appConfiguration) || !getHasCustomizedA11yFooterLink()) {
      return null;
    }

    return appConfiguration.attributes.settings
      .custom_accessibility_statement_link.url;
  };

  const smallerThanSmallTablet =
    windowSize.windowWidth <= viewportWidths.tablet;
  const hasCustomizedA11yFooterLink = getHasCustomizedA11yFooterLink();
  const customizedA11yHref = getCustomizedA11yHref();
  const removeVendorBranding = useFeatureFlag({
    name: 'remove_vendor_branding',
  });

  return (
    <Container insideModal={insideModal} id="hook-footer" className={className}>
      <FooterContainer>
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
              <StyledLink to="/site-map">
                <FormattedMessage {...messages.siteMap} />
              </StyledLink>
            </PagesNavListItem>
          </PagesNavList>
        </PagesNav>

        <Right>
          {!removeVendorBranding && (
            <PoweredBy>
              <PoweredByText>
                <FormattedMessage {...messages.poweredBy} />
              </PoweredByText>
              <CitizenlabLink href="https://www.citizenlab.co/" target="_blank">
                <CitizenLabLogo
                  name="citizenlab-footer-logo"
                  title="CitizenLab"
                />
              </CitizenlabLink>
            </PoweredBy>
          )}
          <StyledSendFeedback showFeedbackText={smallerThanSmallTablet} />
        </Right>
      </FooterContainer>
    </Container>
  );
};

export default injectIntl(PlatformFooter);
