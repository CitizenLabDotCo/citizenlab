import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet-async';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const AccessibilityStatement = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.headTitle)}</title>
        <meta
          name="description"
          content={formatMessage(messages.pageDescription)}
        />
        <meta property="og:title" content={formatMessage(messages.headTitle)} />
        <meta name="title" content={formatMessage(messages.headTitle)} />
        <meta
          property="og:description"
          content={formatMessage(messages.pageDescription)}
        />
      </Helmet>
      <main className="e2e-page-accessibility-statement">
        <Container>
          <PageContent>
            <StyledContentContainer>
              <PageTitle>
                <FormattedMessage {...messages.title} />
              </PageTitle>
              <Box>
                <QuillEditedContent>
                  <p>
                    <FormattedMessage
                      {...messages.intro2022}
                      values={{
                        goVocalLink: (
                          <a
                            href="https://www.govocal.com/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Go Vocal
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
                  <p>WCAG 2.2 AA</p>
                  <h2>{formatMessage(messages.conformanceExceptions)}</h2>
                  <p>{formatMessage(messages.contentConformanceExceptions)}</p>
                  <h3>{formatMessage(messages.embeddedSurveyTools)}</h3>
                  <p>{formatMessage(messages.embeddedSurveyToolsException)}</p>
                  <h3>{formatMessage(messages.mapping)}</h3>
                  <p>{formatMessage(messages.mapping_1)}</p>
                  <p>{formatMessage(messages.mapping_2)}</p>
                  <p>{formatMessage(messages.mapping_3)}</p>
                  <p>{formatMessage(messages.mapping_4)}</p>
                  <h3>{formatMessage(messages.userGeneratedContent)}</h3>
                  <p>{formatMessage(messages.exception_1)}</p>
                  <h3>{formatMessage(messages.workshops)}</h3>
                  <p>{formatMessage(messages.onlineWorkshopsException)}</p>
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
                  <p>{formatMessage(messages.publicationDate2024)}</p>
                  <h2>{formatMessage(messages.feedbackProcessTitle)}</h2>
                  <p>{formatMessage(messages.feedbackProcessIntro)}</p>
                  <ul>
                    <li>
                      {formatMessage(messages.email)}{' '}
                      <a href="mailto:support@govocal.com">
                        support@govocal.com
                      </a>
                    </li>
                    <li>
                      {formatMessage(messages.postalAddress)}{' '}
                      <address>
                        {formatMessage(messages.govocalAddress2022)}
                      </address>
                    </li>
                  </ul>
                  <p>{formatMessage(messages.responsiveness)}</p>
                </QuillEditedContent>
              </Box>
            </StyledContentContainer>
          </PageContent>
        </Container>
      </main>
    </>
  );
};

export default AccessibilityStatement;
