// libraries
import React from 'react';
import Helmet from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';

// services
import { LEGAL_PAGES } from 'services/pages';

// components
import Link from 'utils/cl-router/Link';
import ContentContainer from 'components/ContentContainer';
import Icon from 'components/UI/Icon';
import Footer from 'components/Footer';
import Fragment from 'components/Fragment';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

// these styled components should be imported from PagesShowPage for consistency.
// but : https://github.com/styled-components/styled-components/issues/1063

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const SContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
`;

const PageContent = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl};
    line-height: 34px;
  `}
`;

const PageDescription = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: 25px;

  h1 {
    font-size: ${fontSizes.xxxl}px;
    line-height: 35px;
    font-weight: 600;
  }

  h2 {
    padding-top: 30px;
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 600;
  }

  h3 {
    padding-top: 20px;
    font-size: ${fontSizes.xl}px;
    line-height: 30px;
    font-weight: 600;
  }

  p {
    font-size: ${fontSizes.large}px;
    font-weight: 300;
    line-height: 27px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${colors.clBlueDark};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }
`;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  font-weight: 800;
  text-decoration: none;
  margin: 0;
  padding: 0;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
  }
`;

const PagesNavWrapper = styled.div`
  width: 100%;
`;

const PagesNav = styled.nav`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  list-style: none;
  margin: 0 auto;
  padding-top: 90px;
  padding-bottom: 80px;
`;

const StyledLink = styled(Link)`
  color: #666;
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 20px 23px;
  border-radius: 5px;
  border: solid 1px ${colors.separation};
  background: #fff;
  transition: all 100ms ease-out;

  &:hover {
    color: #000;
    border-color: #999;
  }
`;

const LinkIcon = styled(Icon)`
  width: 11px;
  height: 1em;
`;

const openConsentManager = () => eventEmitter.emit('footer', 'openConsentManager', null);

const CookiePolicy = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;
  return (
    <Container>
      <Helmet>
        <title>{formatMessage(messages.cookiePolicyTitle)}</title>
        <meta name="description" content={formatMessage(messages.cookiePolicyDescription)} />
      </Helmet>

      <PageContent>
        <SContentContainer>
          <Fragment name="pages/cookie-policy/content">
            <PageTitle>
              <FormattedMessage {...messages.cookiePolicyTitle} />
            </PageTitle>
            <PageDescription>
              <FormattedMessage tagName="p" {...messages.intro} />
              <FormattedMessage
                tagName="p"
                {...messages.changePreferences}
                values={{
                  changePreferencesButton: (
                    <StyledButton onClick={openConsentManager}>
                      <FormattedMessage {...messages.changePreferencesButtonText} />
                    </StyledButton>
                  )
                }}
              />
              <FormattedMessage tagName="h2" {...messages.whoAreWeTitle} />
              <FormattedMessage
                tagName="p"
                {...messages.whoAreWeContent}
                values={{
                  citizenLabLink: (
                    <a target="_blank" href={formatMessage(messages.citizenLabHref)}>
                      CitizenLab
                    </a>
                  )
                }}
              />
              <FormattedMessage tagName="h2" {...messages.whatAreCookiesTitle} />
              <FormattedMessage
                tagName="p"
                {...messages.whatAreCookiesContent}
                values={{
                  wikipediaCookieLink: (
                    <a target="_blank" href={props.intl.formatMessage(messages.wikipediaCookieLinkHref)}>
                      {formatMessage(messages.wikipediaCookieLinkText)}
                    </a>
                  )
                }}
              />
              <FormattedMessage tagName="h2" {...messages.whatCookiesTitle} />
              <FormattedMessage {...messages.whatCookiesContent} />
              <FormattedMessage tagName="h3" {...messages.analyticsTitle} />
              <FormattedMessage
                tagName="p"
                {...messages.analyticsContent}
                values={{
                  analyticsLink: (
                    <a target="_blank" href={formatMessage(messages.analyticsHref)}>
                      {formatMessage(messages.analyticsLinkText)}
                    </a>
                  )
                }}
              />
              <FormattedMessage tagName="h3" {...messages.advertisingTitle} />
              <FormattedMessage
                tagName="p"
                {...messages.advertisingContent}
                values={{
                  advertisingLink: (
                    <a target="_blank" href={formatMessage(messages.advertisingHref)}>
                      {formatMessage(messages.advertisingLinkText)}
                    </a>
                  )
                }}
              />
              <FormattedMessage tagName="h3" {...messages.functionalTitle} />
              <FormattedMessage
                tagName="p"
                {...messages.functionalContent}
                values={{
                  functionalLink: (
                    <a target="_blank" href={formatMessage(messages.functionalHref)}>
                      {formatMessage(messages.functionalLinkText)}
                    </a>
                  )
                }}
              />
              <FormattedMessage
                tagName="p"
                {...messages.cookiesList}
                values={{
                  cookiesListButton: (
                    <StyledButton onClick={openConsentManager}>
                      {formatMessage(messages.cookiesListButtonText)}
                    </StyledButton>
                  )
                }}
              />
              <FormattedMessage tagName="p" {...messages.contactInfo} />
            </PageDescription>
          </Fragment>
        </SContentContainer>
      </PageContent>

        <PagesNavWrapper>
          <PagesNav>
            <SContentContainer>
              {LEGAL_PAGES.map((pageSlug) => (
                <StyledLink to={`/pages/${pageSlug}`} key={pageSlug}>
                  <FormattedMessage {...messages[`${pageSlug}PageName`]} />
                  <LinkIcon name="chevron-right" />
                </StyledLink>
              ))}
            </SContentContainer>
          </PagesNav>
        </PagesNavWrapper>
      }

      <Footer showCityLogoSection={false} />
    </Container>
  );
};

export default injectIntl(CookiePolicy);
