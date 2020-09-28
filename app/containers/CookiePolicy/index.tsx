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
import Fragment from 'components/Fragment';
import { Spinner } from 'cl2-component-library';
const PagesFooterNavigation = lazy(() =>
  import('containers/PagesShowPage/PagesFooterNavigation')
);
import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
  PageDescription,
} from 'containers/PagesShowPage';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';
import QuillEditedContent from 'components/UI/QuillEditedContent';

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

      <Suspense fallback={<Spinner />}>
        <PagesFooterNavigation currentPageSlug="cookie-policy" />
      </Suspense>
    </Container>
  );
});

export default injectIntl(CookiePolicy);
