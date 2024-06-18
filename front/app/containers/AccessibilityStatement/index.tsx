import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet';

import useLocale from 'hooks/useLocale';

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

const sectionStyle = {
  marginBottom: '2rem',
  padding: '1rem',
  border: `1px solid ${colors.divider}`,
  borderRadius: '8px',
};

const AccessibilityStatement = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const isLocaleFrench = locale === 'fr-FR';

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
                    <div style={sectionStyle}>
                      <h2>{formatMessage(messages.conformanceStatus)}</h2>
                      <p>{formatMessage(messages.websiteConformsTo)}</p>
                      <ul>
                        <li>WCAG 2.2 AA</li>
                        <li>RGAA v4.1</li>
                      </ul>
                    </div>

                    <div style={sectionStyle}>
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
                    </div>

                    <div style={sectionStyle}>
                      <h2>{formatMessage(messages.compatibilityTitle)}</h2>
                      <p>{formatMessage(messages.screenReaderBugWarning)}</p>
                      <h4>
                        {formatMessage(messages.screenReaderSearchResults)}
                      </h4>
                      <p>
                        {formatMessage(
                          messages.screenReaderSearchResultsException
                        )}
                      </p>
                    </div>

                    <div style={sectionStyle}>
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
                    </div>

                    <div style={sectionStyle}>
                      <h2>{formatMessage(messages.publicationDate)}</h2>
                      <p>{formatMessage(messages.publicationDateIntro)}</p>
                    </div>

                    <div style={sectionStyle}>
                      <h2>{formatMessage(messages.multiYearPlanTitle)}</h2>
                      <h3>{formatMessage(messages.introduction)}</h3>
                      <p>{formatMessage(messages.introductionContent)}</p>
                      <h3>{formatMessage(messages.currentStatus)}</h3>
                      <p>{formatMessage(messages.currentStatusContent)}</p>
                      <h3>{formatMessage(messages.certificationAndAudits)}</h3>
                      <h4>{formatMessage(messages.goal)}</h4>
                      <p>{formatMessage(messages.goalContent)}</p>
                      <h4>{formatMessage(messages.plan)}</h4>
                      <ul>
                        <li>{formatMessage(messages.certification)}</li>
                        <ul>
                          <li>{formatMessage(messages.certificationPoint1)}</li>
                          <li>{formatMessage(messages.certificationPoint2)}</li>
                          <li>{formatMessage(messages.certificationPoint3)}</li>
                        </ul>
                        <li>{formatMessage(messages.periodicAudits)}</li>
                        <ul>
                          <li>{formatMessage(messages.auditPoint1)}</li>
                          <li>{formatMessage(messages.auditPoint2)}</li>
                        </ul>
                        <li>
                          {formatMessage(messages.accessibilityViolations)}
                        </li>
                      </ul>
                      <h4>{formatMessage(messages.internalMonitoring)}</h4>
                      <ul>
                        <li>{formatMessage(messages.monitoringPoint1)}</li>
                        <li>{formatMessage(messages.monitoringPoint2)}</li>
                        <li>{formatMessage(messages.monitoringPoint3)}</li>
                      </ul>
                    </div>

                    <>
                      {isLocaleFrench && (
                        <div style={sectionStyle}>
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
                        </div>
                      )}
                    </>

                    <div style={sectionStyle}>
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
                    </div>
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
