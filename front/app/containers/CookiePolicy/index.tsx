import React from 'react';

import { Helmet } from 'react-helmet-async';

import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import T from 'components/T';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';

import DefaultText from './DefaultText';
import messages from './messages';

const CookiePolicy = () => {
  const { formatMessage } = useIntl();

  const { data: page, isLoading } = useCustomPageBySlug('cookie-policy');
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
        {isLoading ? (
          <FullPageSpinner />
        ) : (
          <Container>
            <PageContent>
              <StyledContentContainer>
                <PageTitle>
                  {pageAttributes?.title_multiloc ? (
                    <T value={pageAttributes.title_multiloc} />
                  ) : (
                    formatMessage(messages.cookiePolicyTitle)
                  )}
                </PageTitle>
                <QuillEditedContent>
                  {pageAttributes?.top_info_section_multiloc ? (
                    <T
                      value={pageAttributes.top_info_section_multiloc}
                      supportHtml
                    />
                  ) : (
                    <DefaultText />
                  )}
                </QuillEditedContent>
              </StyledContentContainer>
            </PageContent>
          </Container>
        )}
      </main>
    </>
  );
};

export default CookiePolicy;
