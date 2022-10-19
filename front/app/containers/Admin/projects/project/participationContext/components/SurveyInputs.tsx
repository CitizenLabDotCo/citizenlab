import React from 'react';

// components
import { Input, IconTooltip, Box } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { StyledA, StyledWarning, SurveyServiceRadio } from './styling';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// typings
import { TSurveyService } from 'services/participationContexts';
import { ApiErrors } from '..';

interface Props {
  survey_service: TSurveyService | null | undefined;
  survey_embed_url: string | null | undefined;
  apiErrors: ApiErrors;
  surveyProviders: { [key in TSurveyService]: boolean };
  handleSurveyProviderChange: (survey_service: TSurveyService) => void;
  handleSurveyEmbedUrlChange: (survey_embed_url: string) => void;
}

export default injectIntl<Props & WrappedComponentProps>(
  ({
    intl: { formatMessage },
    survey_service,
    survey_embed_url,
    apiErrors,
    surveyProviders,
    handleSurveyProviderChange,
    handleSurveyEmbedUrlChange,
  }) => (
    <>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.surveyService} />
        </SubSectionTitle>
        <StyledWarning>
          <FormattedMessage
            {...messages.surveyServiceTooltip}
            values={{
              surveyServiceTooltipLink: (
                <StyledA
                  href={formatMessage(messages.surveyServiceTooltipLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FormattedMessage
                    {...messages.surveyServiceTooltipLinkText}
                  />
                </StyledA>
              ),
            }}
          />
        </StyledWarning>
        {Object.keys(surveyProviders).map((provider: TSurveyService) => {
          if (surveyProviders[provider]) {
            return (
              <SurveyServiceRadio
                onChange={handleSurveyProviderChange}
                currentValue={survey_service}
                value={provider}
                name="survey-provider"
                id={`survey-provider-${provider}`}
                label={
                  {
                    google_forms: (
                      <Box display="flex">
                        <Box mr="5px">
                          <FormattedMessage {...messages.google_forms} />
                        </Box>
                        <IconTooltip
                          content={
                            <FormattedMessage
                              {...messages.googleFormsTooltip}
                              values={{
                                googleFormsTooltipLink: (
                                  <StyledA
                                    href={formatMessage(
                                      messages.googleFormsTooltipLink
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FormattedMessage
                                      {...messages.googleFormsTooltipLinkText}
                                    />
                                  </StyledA>
                                ),
                              }}
                            />
                          }
                        />
                      </Box>
                    ),
                    typeform: (
                      <Box display="flex">
                        <Box mr="5px">
                          <FormattedMessage {...messages.typeform} />
                        </Box>
                        <IconTooltip
                          content={
                            <FormattedMessage
                              {...messages.hiddenFieldsTip}
                              values={{
                                hiddenFieldsLink: (
                                  <a
                                    href={formatMessage(
                                      messages.hiddenFieldsSupportArticleUrl
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {formatMessage(
                                      messages.hiddenFieldsLinkText
                                    )}
                                  </a>
                                ),
                              }}
                            />
                          }
                        />
                      </Box>
                    ),
                    survey_monkey: formatMessage(messages.survey_monkey),
                    survey_xact: formatMessage(messages.survey_xact),
                    enalyzer: formatMessage(messages.enalyzer),
                    qualtrics: formatMessage(messages.qualtrics),
                    smart_survey: formatMessage(messages.smart_survey),
                    snap_survey: formatMessage(messages.snap_survey),
                    microsoft_forms: formatMessage(messages.microsoft_forms),
                  }[provider]
                }
                key={provider}
              />
            );
          }
          return null;
        })}
        <Error apiErrors={apiErrors && apiErrors.survey_service} />
      </SectionField>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.surveyEmbedUrl} />
        </SubSectionTitle>
        <Input
          onChange={handleSurveyEmbedUrlChange}
          type="text"
          value={survey_embed_url}
        />
        <Error apiErrors={apiErrors && apiErrors.survey_embed_url} />
      </SectionField>
    </>
  )
);
