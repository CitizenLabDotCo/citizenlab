import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
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

import messages from './messages';

const StyledButton = styled.button`
  color: ${colors.teal};
  font-weight: inherit;
  text-decoration: underline;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.teal)};
    text-decoration: underline;
  }
`;

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
                    <p>{formatMessage(messages.intro)}</p>
                    <h2>{formatMessage(messages.whatDoWeUseCookiesFor)}</h2>
                    <p>
                      <FormattedMessage
                        {...messages.viewPreferencesText}
                        values={{
                          viewPreferencesButton: (
                            <StyledButton
                              data-testid="viewPreferencesButton"
                              onClick={openConsentManager}
                            >
                              {formatMessage(
                                messages.viewPreferencesButtonText
                              )}
                            </StyledButton>
                          ),
                        }}
                      />
                    </p>

                    <h3>{formatMessage(messages.analyticsTitle)}</h3>
                    <p>{formatMessage(messages.analyticsContent)}</p>

                    <h3>{formatMessage(messages.advertisingTitle)}</h3>
                    <p>{formatMessage(messages.advertisingContent)}</p>

                    <h3>{formatMessage(messages.functionalTitle)}</h3>
                    <p>{formatMessage(messages.functionalContent)}</p>

                    <h3>{formatMessage(messages.essentialTitle)}</h3>
                    <p>{formatMessage(messages.essentialContent)}</p>

                    <h3>{formatMessage(messages.externalTitle)}</h3>
                    <p>{formatMessage(messages.externalContent)}</p>

                    <h2>{formatMessage(messages.manageCookiesTitle)}</h2>
                    <p>{formatMessage(messages.manageCookiesDescription)}</p>
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
