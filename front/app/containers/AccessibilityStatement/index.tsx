import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet';

import {
  Container,
  StyledContentContainer,
  PageContent,
  PageTitle,
} from 'containers/PagesShowPage';

import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const AccessibilityStatement = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.title)}</title>
        <meta
          name="description"
          content={formatMessage(messages.pageDescription)}
        />
      </Helmet>
      <main className="e2e-page-accessibility-statement">
        <Container>
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
                    {/* TODO:
                      Change to correct standard after getting the certificate.
                    */}
                    <p>{formatMessage(messages.websiteConformsTo)}</p>
                    <ul>
                      <li>WCAG 2.2 AA</li>
                      <li>RGAA v4.1</li>
                    </ul>
                    <h2>{formatMessage(messages.conformanceExceptions)}</h2>
                    <p>
                      {formatMessage(messages.contentConformanceExceptions)}
                    </p>
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
                      {formatMessage(
                        messages.screenReaderSearchResultsException
                      )}
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

                    <h3>{formatMessage(messages.defenderOfRights)}</h3>
                    <p>{formatMessage(messages.accessibilityDefect)}</p>
                    <p>{formatMessage(messages.severalMeans)}</p>
                    <ul>
                      <li>
                        <a
                          href={formatMessage(messages.contactFormLink)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatMessage(messages.contactForm)}
                        </a>
                      </li>
                      <li>
                        <FormattedMessage
                          {...messages.withContactInfo}
                          values={{
                            listOfDelegatesLinkText: (
                              <a
                                href={formatMessage(
                                  messages.listOfDelegatesLink
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FormattedMessage
                                  {...messages.listOfDelegatesLinkText}
                                />
                              </a>
                            ),
                          }}
                        />
                      </li>
                      <li>{formatMessage(messages.telephoneNumber)}</li>
                      <li>
                        <FormattedMessage
                          {...messages.postalAddressFr}
                          values={{
                            administrationDirectoryLinkText: (
                              <a
                                href={formatMessage(
                                  messages.administrationDirectoryLink
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <FormattedMessage
                                  {...messages.administrationDirectoryLinkText}
                                />
                              </a>
                            ),
                          }}
                        />
                      </li>
                    </ul>
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

export default AccessibilityStatement;
