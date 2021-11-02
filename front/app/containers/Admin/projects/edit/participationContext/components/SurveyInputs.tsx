import React from 'react';

// components
import { Input, Radio, IconTooltip } from 'cl2-component-library';
import Error from 'components/UI/Error';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { StyledA, StyledWarning } from './styling';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { SurveyServices } from 'services/participationContexts';
import { ApiErrors } from '..';

interface Props {
  survey_service: SurveyServices | null | undefined;
  survey_embed_url: string | null | undefined;
  apiErrors: ApiErrors;
  surveyProviders: { [key in SurveyServices]: boolean };
  handleSurveyProviderChange: (survey_service: SurveyServices) => void;
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
        {Object.keys(surveyProviders).map((provider) => {
          if (surveyProviders[provider]) {
            return (
              <Radio
                onChange={handleSurveyProviderChange}
                currentValue={survey_service}
                value={provider}
                name="survey-provider"
                id={`survey-provider-${provider}`}
                label={<FormattedMessage {...messages[provider]} />}
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
