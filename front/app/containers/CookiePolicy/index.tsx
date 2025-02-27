import React from 'react';

import { Helmet } from 'react-helmet-async';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';

import DefaultText from './DefaultText';
import messages from './messages';

const CookiePolicy = () => {
  const { formatMessage } = useIntl();

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
                  <DefaultText />
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
