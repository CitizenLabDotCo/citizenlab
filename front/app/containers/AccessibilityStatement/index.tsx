// libraries
import React, { memo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import { Spinner } from 'cl2-component-library';
import Fragment from 'components/Fragment';
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
import QuillEditedContent from 'components/UI/QuillEditedContent';

const CookiePolicy = memo((props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  return (
    <Container className="e2e-page-accessibility-statement">
      <Helmet>
        <title>{formatMessage(messages.title)}</title>
        <meta
          name="description"
          content={formatMessage(messages.pageDescription)}
        />
      </Helmet>

      <PageContent>
        <StyledContentContainer>
          <Fragment name="pages/cookie-policy/content">
            <PageTitle>
              <FormattedMessage {...messages.title} />
            </PageTitle>
            <PageDescription>
              <QuillEditedContent>
                <p>{formatMessage(messages.intro)}</p>
                <h2>{formatMessage(messages.conformanceStatus)}</h2>
                <h3>{formatMessage(messages.currentStandard)}</h3>
                <p>WCAG 2.1 AA</p>
                <h3>{formatMessage(messages.contentConformanceTitle)}</h3>
                <p>{formatMessage(messages.contentConformanceInfo)}</p>
                <p>{formatMessage(messages.contentConformanceExceptions)}</p>
                <ul>
                  <li>{formatMessage(messages.exception_1)}</li>
                  <li>{formatMessage(messages.exception2)}</li>
                </ul>
                <h2>{formatMessage(messages.compatibilityTitle)}</h2>
                <p>{formatMessage(messages.compatibilityInfo)}</p>
                <p>{formatMessage(messages.screenReaderBugWarning)}</p>
                <h2>{formatMessage(messages.technologiesTitle)}</h2>
                <p>{formatMessage(messages.technologiesIntro)}</p>
                <ul>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript</li>
                </ul>
                <h2>{formatMessage(messages.assesmentMethodsTitle)}</h2>
                <p>
                  <FormattedMessage
                    {...messages.assesmentText}
                    values={{
                      statusPageLink: (
                        <a
                          href="http://label.anysurfer.be/index.php?id=689&l=en"
                          target="_blank"
                        >
                          {formatMessage(messages.statusPageText)}
                        </a>
                      ),
                    }}
                  />
                </p>
                <h2>{formatMessage(messages.feedbackProcessTitle)}</h2>
                <p>{formatMessage(messages.feedbackProcessIntro)}</p>
                <ul>
                  <li>
                    {formatMessage(messages.email)}{' '}
                    <a href="mailto:support@citizenlab.co">
                      support@citizenlab.co
                    </a>
                  </li>
                  <li>
                    {formatMessage(messages.postalAddress)}{' '}
                    <address>
                      {formatMessage(messages.citizenLabAddress)}
                    </address>
                  </li>
                </ul>
                <p>{formatMessage(messages.responsiveness)}</p>
              </QuillEditedContent>
            </PageDescription>
          </Fragment>
        </StyledContentContainer>
      </PageContent>

      <Suspense fallback={<Spinner />}>
        <PagesFooterNavigation currentPageSlug="accessibility-statement" />
      </Suspense>
    </Container>
  );
});

export default injectIntl(CookiePolicy);
