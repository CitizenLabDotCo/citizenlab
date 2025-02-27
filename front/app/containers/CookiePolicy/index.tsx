import React from 'react';

import { Helmet } from 'react-helmet-async';

import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import Fragment from 'components/Fragment';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import DefaultText from './DefaultText';
import messages from './messages';
import StyledButton from './StyledButton';

const CookiePolicy = () => {
  const { formatMessage } = useIntl();
  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  const { data: page } = useCustomPageBySlug('cookie-policy');
  const pageAttributes = page?.data.attributes;

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.headCookiePolicyTitle)}</title>
        <meta
          name="description"
          content={formatMessage(messages.cookiePolicyDescription)}
        />
        <meta
          name="title"
          content={formatMessage(messages.headCookiePolicyTitle)}
        />
        <meta
          property="og:title"
          content={formatMessage(messages.headCookiePolicyTitle)}
        />
        <meta
          name="description"
          content={formatMessage(messages.cookiePolicyDescription)}
        />
        <meta
          property="og:description"
          content={formatMessage(messages.cookiePolicyDescription)}
        />
      </Helmet>
      <main className="e2e-page-cookie-policy" data-testid="cookiePolicy">
        <Container>
          <PageContent>
            <StyledContentContainer>
              <Fragment name="pages/cookie-policy/content">
                <PageTitle>
                  {formatMessage(messages.cookiePolicyTitle)}
                </PageTitle>
                <QuillEditedContent>
                  {pageAttributes?.top_info_section_enabled ? (
                    <T value={pageAttributes.top_info_section_multiloc} />
                  ) : (
                    <DefaultText openConsentManager={openConsentManager} />
                  )}
                  <FormattedMessage
                    tagName="p"
                    {...messages.manageCookiesPreferences}
                    values={{
                      manageCookiesPreferencesButtonText: (
                        <StyledButton
                          onClick={openConsentManager}
                          data-testid="managePreferencesButton"
                        >
                          {formatMessage(
                            messages.manageCookiesPreferencesButtonText
                          )}
                        </StyledButton>
                      ),
                    }}
                  />
                </QuillEditedContent>
              </Fragment>
            </StyledContentContainer>
          </PageContent>
        </Container>
      </main>
    </>
  );
};

export default CookiePolicy;
