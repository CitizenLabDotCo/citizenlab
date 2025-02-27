import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';

import styled from 'styled-components';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import Fragment from 'components/Fragment';
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
                <Box>
                  <QuillEditedContent>
                    <DefaultText openConsentManager={openConsentManager} />
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
                </Box>
              </Fragment>
            </StyledContentContainer>
          </PageContent>
        </Container>
      </main>
    </>
  );
};

export default CookiePolicy;
