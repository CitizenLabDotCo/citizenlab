import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Multiloc, Locale } from 'typings';
import { ideaStatusCodes, TIdeaStatusCode } from 'services/ideaStatuses';

// components
import FormikColorPickerInput from 'components/UI/FormikColorPickerInput';
import FormikRadio from 'components/UI/FormikRadio';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { Label, IconTooltip } from 'cl2-component-library';
import FormikTextAreaMultilocWithLocaleSwitcher from 'components/UI/FormikTextAreaMultilocWithLocaleSwitcher';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';

import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

export interface FormValues {
  color: string;
  code: TIdeaStatusCode;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface Props {
  ideaStatusId: string;
}

const StyledSection = styled(Section)`
  margin-bottom: 40px;
`;

const StyledFormikRadio = styled(FormikRadio)`
  margin-bottom: 25px;
`;

const LabelText = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2px;

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .header {
    padding: 0;
    margin: 0;
    margin-bottom: 3px;
    font-weight: 600;
    font-size: ${fontSizes.base}px;
  }

  .description {
    color: ${colors.adminSecondaryTextColor};
  }
`;

const StyledLabel = styled(Label)`
  margin-bottom: 32px;
`;

export function validate(tenantLocales: Locale[]) {
  return function (values: FormValues) {
    const errors: FormikErrors<FormValues> = {};
    // the default idea statuses have titles for every possible locale,
    // not just the tenant locale, so without filtering our the
    // irrelevant languages, the edit form could be submitted
    // with all titles empty for the tenant locales
    const tenantLocalesTitleMultiloc = {};

    tenantLocales.forEach((locale) => {
      tenantLocalesTitleMultiloc[locale] = values.title_multiloc[locale];
    });

    if (every(getValues(tenantLocalesTitleMultiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  };
}

const IdeaStatusForm = ({
  isSubmitting,
  errors,
  isValid,
  touched,
  status,
  intl: { formatMessage },
}: InjectedFormikProps<Props & InjectedIntlProps, FormValues>) => {
  return (
    <Form>
      <StyledSection>
        <SectionField>
          <Label>
            <FormattedMessage {...messages.fieldColor} />
          </Label>
          <Field name="color" component={FormikColorPickerInput} />
        </SectionField>
      </StyledSection>
      <StyledSection>
        <SectionField>
          <Field
            name="title_multiloc"
            component={FormikInputMultilocWithLocaleSwitcher}
            label={formatMessage(messages.fieldTitle)}
          />
          {touched.title_multiloc && (
            <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc as any}
            />
          )}
        </SectionField>
      </StyledSection>

      <StyledSection>
        <SectionField>
          <Field
            name="description_multiloc"
            component={FormikTextAreaMultilocWithLocaleSwitcher}
            label={formatMessage(messages.fieldDescription)}
          />
          {touched.description_multiloc && (
            <Error
              fieldName="description_multiloc"
              apiErrors={errors.description_multiloc as any}
            />
          )}
        </SectionField>
      </StyledSection>

      <StyledSection>
        <SectionField>
          <StyledLabel>
            <FormattedMessage {...messages.category} />
            <IconTooltip
              content={<FormattedMessage {...messages.categoryDescription} />}
            />
          </StyledLabel>
          {ideaStatusCodes.map((code: TIdeaStatusCode, i) => (
            <StyledFormikRadio
              key={`code-input-${i}`}
              label={
                <LabelText>
                  <span className="header">
                    {formatMessage(
                      {
                        proposed: messages.proposedFieldCodeTitle,
                        viewed: messages.viewedFieldCodeTitle,
                        under_consideration:
                          messages.under_considerationFieldCodeTitle,
                        accepted: messages.acceptedFieldCodeTitle,
                        implemented: messages.implementedFieldCodeTitle,
                        rejected: messages.rejectedFieldCodeTitle,
                        custom: messages.customFieldCodeTitle,
                      }[`${code}FieldCodeTitle`]
                    )}
                  </span>
                  {code !== 'custom' && (
                    <span className="description">
                      {formatMessage(
                        {
                          proposed: messages.proposedFieldCodeDescription,
                          viewed: messages.viewedFieldCodeDescription,
                          under_consideration:
                            messages.under_considerationFieldCodeDescription,
                          accepted: messages.acceptedFieldCodeDescription,
                          implemented: messages.implementedFieldCodeDescription,
                          rejected: messages.rejectedFieldCodeDescription,
                        }[`${code}FieldCodeDescription`]
                      )}
                    </span>
                  )}
                </LabelText>
              }
              id={`${code}-input`}
              name="code"
              value={code}
            />
          ))}
          {touched.code && <Error apiErrors={errors.code as any} />}
        </SectionField>
      </StyledSection>

      <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
    </Form>
  );
};

export default injectIntl(IdeaStatusForm);
