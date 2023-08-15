// libraries
import React, { memo } from 'react';
import { Helmet } from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// components
import Fragment from 'components/Fragment';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Box } from '@citizenlab/cl2-component-library';

const CookiePolicy = memo((props: WrappedComponentProps) => {
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
          <Fragment name="pages/accessibility-statement">
            <PageTitle>
              <FormattedMessage {...messages.title} />
            </PageTitle>
            <Box>
              <QuillEditedContent>
                <p>
                  <FormattedMessage
                    {...messages.intro2022}
                    values={{
                      citizenLabLink: (
                        <a
                          href="https://www.citizenlab.co/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          CitizenLab
                        </a>
                      ),
                    }}
                  />
                </p>
                <p>
                  <FormattedMessage
                    {...messages.applicability}
                    values={{
                      demoPlatformLink: (
                        <a
                          href="https://accessibility-audit.citizenlab.co/en/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.demoPlatformLinkText)}
                        </a>
                      ),
                    }}
                  />
                </p>
                <h2>{formatMessage(messages.conformanceStatus)}</h2>
                <p>WCAG 2.1 AA</p>
                <h2>{formatMessage(messages.conformanceExceptions)}</h2>
                <p>{formatMessage(messages.contentConformanceExceptions)}</p>
                <h3>{formatMessage(messages.surveyTools)}</h3>
                <p>{formatMessage(messages.surveyToolsException)}</p>
                <h3>{formatMessage(messages.mapviewIdeas)}</h3>
                <p>{formatMessage(messages.mapviewIdeasException)}</p>
                <h3>{formatMessage(messages.userGeneratedContent)}</h3>
                <p>{formatMessage(messages.exception_1)}</p>
                <h3>{formatMessage(messages.workshops)}</h3>
                <p>{formatMessage(messages.onlineWorkshopsException)}</p>
                <h3>{formatMessage(messages.compatibilityTitle)}</h3>
                <p>{formatMessage(messages.screenReaderBugWarning)}</p>
                <h4>{formatMessage(messages.screenReaderSearchResults)}</h4>
                <p>
                  {formatMessage(messages.screenReaderSearchResultsException)}
                </p>
                <h2>{formatMessage(messages.assesmentMethodsTitle)}</h2>
                <p>
                  <FormattedMessage
                    {...messages.assesmentText2022}
                    values={{
                      statusPageLink: (
                        <a
                          href="https://www.anysurfer.be/en/labels/anysurfer-label-for-websites/status/689"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.statusPageText)}
                        </a>
                      ),
                      demoPlatformLink: (
                        <a
                          href="https://accessibility-audit.citizenlab.co/en/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.demoPlatformLinkText)}
                        </a>
                      ),
                    }}
                  />
                </p>
                <h2>{formatMessage(messages.publicationDate)}</h2>
                <p>{formatMessage(messages.publicationDateIntro)}</p>
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
                      {formatMessage(messages.citizenLabAddress2022)}
                    </address>
                  </li>
                </ul>
                <p>{formatMessage(messages.responsiveness)}</p>
              </QuillEditedContent>
            </Box>
          </Fragment>
        </StyledContentContainer>
      </PageContent>
    </Container>
  );
});

export default injectIntl(CookiePolicy);
