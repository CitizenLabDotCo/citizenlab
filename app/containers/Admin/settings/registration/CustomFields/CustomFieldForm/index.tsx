import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { IInputType } from 'services/userCustomFields';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikToggle from 'components/UI/FormikToggle';
import FormikSelect from 'components/UI/FormikSelect';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { Label } from 'cl2-component-library';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

export interface FormValues {
  enabled: boolean;
  input_type: IInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
}

export interface Props {
  mode: 'new' | 'edit';
  customFieldId: string;
  builtInField: boolean;
}

class CustomFieldForm extends React.Component<
  InjectedFormikProps<Props & InjectedIntlProps, FormValues>
> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  };

  inputTypeOptions = () => {
    const fieldTypes = [
      'text',
      'number',
      'multiline_text',
      'select',
      'multiselect',
      'checkbox',
      'date',
    ];
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: this.props.intl.formatMessage(messages[`inputType_${inputType}`]),
    }));
  };

  render() {
    const {
      isSubmitting,
      mode,
      errors,
      isValid,
      touched,
      builtInField,
      status,
      intl: { formatMessage },
    } = this.props;

    return (
      <Form>
        <Section>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldEnabled} />
            </Label>
            <Field
              className={`e2e-custom-field-enabled-toggle ${
                this.props.values.enabled ? 'enabled' : 'disabled'
              }`}
              name="enabled"
              component={FormikToggle}
            />
            {touched.enabled && (
              <Error fieldName="enabled" apiErrors={errors.enabled as any} />
            )}
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldInputType} />
            </Label>
            <Field
              name="input_type"
              component={FormikSelect}
              options={this.inputTypeOptions()}
              disabled={mode === 'edit' || builtInField}
            />
            {touched.input_type && (
              <Error
                fieldName="input_type"
                apiErrors={errors.input_type as any}
              />
            )}
          </SectionField>

          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={formatMessage(messages.fieldTitle)}
              labelTooltipText={formatMessage(messages.fieldTitleTooltip)}
              disabled={builtInField}
            />
            {touched.title_multiloc && (
              <Error
                fieldName="title_multiloc"
                apiErrors={errors.title_multiloc as any}
              />
            )}
          </SectionField>

          <SectionField>
            <Field
              name="description_multiloc"
              component={FormikTextAreaMultiloc}
              label={formatMessage(messages.fieldDescription)}
              labelTooltipText={formatMessage(messages.fieldDescriptionTooltip)}
              disabled={builtInField}
            />
            {touched.description_multiloc && (
              <Error
                fieldName="description_multiloc"
                apiErrors={errors.description_multiloc as any}
              />
            )}
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldRequired} />
            </Label>
            <Field
              className={`e2e-custom-field-required-toggle ${
                this.props.values.required ? 'enabled' : 'disabled'
              }`}
              name="required"
              component={FormikToggle}
            />
            {touched.required && (
              <Error fieldName="required" apiErrors={errors.required as any} />
            )}
          </SectionField>
        </Section>

        <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
      </Form>
    );
  }
}

export default injectIntl(CustomFieldForm);
