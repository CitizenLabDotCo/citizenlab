// libraries
import React, { memo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';

// components
import ContentContainer from 'components/ContentContainer';
import Fragment from 'components/Fragment';
import { Spinner } from 'cl2-component-library';
const PagesFooterNavigation = lazy(() =>
  import('containers/PagesShowPage/PagesFooterNavigation')
);

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// these styled components should be imported from PagesShowPage for consistency.
// but : https://github.com/styled-components/styled-components/issues/1063

const Container = styled.div`
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
`;

const PageContent = styled.main`
  flex-shrink: 0;
  flex-grow: 1;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
`;

const PageTitle = styled.h1`
  color: ${colors.text};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl};
  `}
`;

const PageDescription = styled.div``;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  font-weight: inherit;
  text-decoration: underline;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const PagesNavWrapper = styled.div`
  width: 100%;
`;

const CookiePolicy = memo((props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  return (
    <Container className="e2e-page-cookie-policy">
      <Helmet>
        <title>{formatMessage(messages.cookiePolicyTitle)}</title>
        <meta
          name="description"
          content={formatMessage(messages.cookiePolicyDescription)}
        />
      </Helmet>

      <PageContent>
        <StyledContentContainer>
          <Fragment name="pages/cookie-policy/content">
            <PageTitle>
              <FormattedMessage {...messages.cookiePolicyTitle} />
            </PageTitle>
            <PageDescription>
              <QuillEditedContent>
                <FormattedMessage tagName="p" {...messages.intro} />
                <FormattedMessage
                  tagName="p"
                  {...messages.changePreferencesText}
                  values={{
                    changePreferencesButton: (
                      <StyledButton
                        onClick={openConsentManager}
                        className="changePreferencesButton"
                      >
                        <FormattedMessage
                          {...messages.changePreferencesButtonText}
                        />
                      </StyledButton>
                    ),
                  }}
                />
                <FormattedMessage
                  tagName="h2"
                  {...messages.whatAreCookiesTitle}
                />
                <FormattedMessage
                  tagName="p"
                  {...messages.whatAreCookiesContent}
                  values={{
                    wikipediaCookieLink: (
                      <a
                        target="_blank"
                        href={props.intl.formatMessage(
                          messages.wikipediaCookieLinkHref
                        )}
                      >
                        {formatMessage(messages.wikipediaCookieLinkText)}
                      </a>
                    ),
                  }}
                />
                <FormattedMessage tagName="h2" {...messages.whatCookiesTitle} />
                <FormattedMessage
                  tagName="p"
                  {...messages.whatCookiesContent}
                />
                <FormattedMessage tagName="h3" {...messages.analyticsTitle} />
                <FormattedMessage
                  tagName="p"
                  {...messages.analyticsContent}
                  values={{
                    analyticsLink: (
                      <a
                        target="_blank"
                        href={formatMessage(messages.analyticsHref)}
                      >
                        {formatMessage(messages.analyticsLinkText)}
                      </a>
                    ),
                  }}
                />
                <FormattedMessage tagName="h3" {...messages.advertisingTitle} />
                <FormattedMessage
                  tagName="p"
                  {...messages.advertisingContent}
                  values={{
                    advertisingLink: (
                      <a
                        target="_blank"
                        href={formatMessage(messages.advertisingHref)}
                      >
                        {formatMessage(messages.advertisingLinkText)}
                      </a>
                    ),
                  }}
                />
                <FormattedMessage tagName="h3" {...messages.functionalTitle} />
                <FormattedMessage
                  tagName="p"
                  {...messages.functionalContent}
                  values={{
                    functionalLink: (
                      <a
                        target="_blank"
                        href={formatMessage(messages.functionalHref)}
                      >
                        {formatMessage(messages.functionalLinkText)}
                      </a>
                    ),
                  }}
                />
                <FormattedMessage
                  tagName="p"
                  {...messages.cookiesListText}
                  values={{
                    cookiesListButton: (
                      <StyledButton
                        onClick={openConsentManager}
                        className="cookieList"
                      >
                        {formatMessage(messages.cookiesListButtonText)}
                      </StyledButton>
                    ),
                  }}
                />
              </QuillEditedContent>
            </PageDescription>
          </Fragment>
        </StyledContentContainer>
      </PageContent>

      <PagesNavWrapper>
        <Suspense fallback={<Spinner />}>
          <PagesFooterNavigation currentPageSlug="cookie-policy" />
        </Suspense>
      </PagesNavWrapper>
    </Container>
  );
});

export default injectIntl(CookiePolicy);
