import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import FormikSelect from 'components/UI/FormikSelect';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { Label, ColorPickerInput } from 'cl2-component-library';

import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

export interface FormValues {
  color: string;
  code: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface Props {
  mode: 'new' | 'edit';
  ideaStatusId: string;
  builtInField: boolean;
}

class IdeaStatusForm extends React.Component<
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

  handleColorChange = () => {};

  codeOptions = () => {
    const codes = [
      'proposed',
      'viewed',
      'under_consideration',
      'accepted',
      'implemented',
      'rejected',
      'other',
    ];

    return codes.map((code) => ({ value: code, label: code }));
  };

  render() {
    const {
      isSubmitting,
      mode,
      initialValues,
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
              <FormattedMessage {...messages.fieldColor} />
            </Label>
            <ColorPickerInput
              type="text"
              value={initialValues.color}
              onChange={this.handleColorChange}
            />
          </SectionField>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldCode} />
            </Label>
            <Field
              name="code"
              component={FormikSelect}
              labelTooltipText={formatMessage(messages.fieldCodeTooltip)}
              disabled={builtInField}
              options={this.codeOptions()}
            />
            {touched.code && (
              <Error fieldName="code" apiErrors={errors.code as any} />
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
        </Section>

        <FormikSubmitWrapper {...{ isValid, isSubmitting, status, touched }} />
      </Form>
    );
  }
}

export default injectIntl(IdeaStatusForm);
