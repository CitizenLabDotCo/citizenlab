// libraries
import React from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';

// components
import Fragment from 'components/Fragment';

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

const CookiePolicy = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  return (
    <Container className="e2e-page-cookie-policy" data-testid="cookiePolicy">
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
            <PageTitle>{formatMessage(messages.cookiePolicyTitle)}</PageTitle>
            <PageDescription>
              <QuillEditedContent>
                <p>{formatMessage(messages.intro)}</p>
                <h2>{formatMessage(messages.whatDoWeUseCookiesFor)}</h2>
                <FormattedMessage
                  tagName="p"
                  {...messages.viewPreferencesText}
                  values={{
                    viewPreferencesButton: (
                      <StyledButton
                        data-testid="viewPreferencesButton"
                        onClick={openConsentManager}
                      >
                        {formatMessage(messages.viewPreferencesButtonText)}
                      </StyledButton>
                    ),
                  }}
                />

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
            </PageDescription>
          </Fragment>
        </StyledContentContainer>
      </PageContent>
    </Container>
  );
};

export default injectIntl(CookiePolicy);
