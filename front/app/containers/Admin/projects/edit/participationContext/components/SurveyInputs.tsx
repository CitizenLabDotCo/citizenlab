import React from 'react';
import styled from 'styled-components';

// components
import { Input, Radio, IconTooltip, Box } from 'cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { StyledA, StyledWarning } from './styling';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { TSurveyService } from 'services/participationContexts';
import { ApiErrors } from '..';

const StyledRadio = styled(Radio)`
  margin-bottom 14px;
`;

const GoogleFormsIconTooltip = styled(IconTooltip)``;

interface Props {
  survey_service: TSurveyService | null | undefined;
  survey_embed_url: string | null | undefined;
  apiErrors: ApiErrors;
  surveyProviders: { [key in TSurveyService]: boolean };
  handleSurveyProviderChange: (survey_service: TSurveyService) => void;
  handleSurveyEmbedUrlChange: (survey_embed_url: string) => void;
}

export default injectIntl<Props & InjectedIntlProps>(
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
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.surveyServiceTooltip}
                values={{
                  surveyServiceTooltipLink: (
                    <StyledA
                      href={formatMessage(messages.surveyServiceTooltipLink)}
                      target="_blank"
                    >
                      <FormattedMessage
                        {...messages.surveyServiceTooltipLinkText}
                      />
                    </StyledA>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>
        <StyledWarning>
          <FormattedMessage
            {...messages.hiddenFieldsTip}
            values={{
              hiddenFieldsLink: (
                <a
                  href={formatMessage(messages.hiddenFieldsSupportArticleUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatMessage(messages.hiddenFieldsLinkText)}
                </a>
              ),
            }}
          />
        </StyledWarning>
        {Object.keys(surveyProviders).map((provider: TSurveyService) => {
          if (surveyProviders[provider]) {
            return (
              <StyledRadio
                onChange={handleSurveyProviderChange}
                currentValue={survey_service}
                value={provider}
                name="survey-provider"
                id={`survey-provider-${provider}`}
                label={
                  provider === 'google_forms' ? (
                    <Box display="flex">
                      <Box mr="5px">
                        <FormattedMessage {...messages.google_forms} />
                      </Box>
                      <GoogleFormsIconTooltip
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
                  ) : (
                    <FormattedMessage
                      {...{
                        typeform: messages.typeform,
                        survey_monkey: messages.survey_monkey,
                        survey_xact: messages.survey_xact,
                        enalyzer: messages.enalyzer,
                        qualtrics: messages.qualtrics,
                        smart_survey: messages.smart_survey,
                        microsoft_forms: messages.microsoft_forms,
                      }[provider]}
                    />
                  )
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
