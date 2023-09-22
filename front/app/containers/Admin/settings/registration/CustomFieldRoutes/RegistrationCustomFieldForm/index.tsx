import React from 'react';
import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';

import { Button, Box } from '@citizenlab/cl2-component-library';

import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean, string } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import Toggle from 'components/HookForm/Toggle';
import Select from 'components/HookForm/Select';
import { Section, SectionField } from 'components/admin/Section';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

export interface FormValues {
  enabled: boolean;
  input_type: IUserCustomFieldInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
}

type Props = {
  mode: 'new' | 'edit';
  customFieldId?: string;
  builtInField: boolean;
  defaultValues?: FormValues;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
} & WrappedComponentProps;

export type FieldType =
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'text'
  | 'multiline_text'
  | 'number'
  | 'date';

export const fieldTypes: FieldType[] = [
  'select',
  'multiselect',
  'checkbox',
  'text',
  'multiline_text',
  'number',
  'date',
];

const RegistrationCustomFieldForm = ({
  intl: { formatMessage },
  defaultValues,
  onSubmit,
  builtInField,
  mode,
}: Props) => {
  const schema = object({
    input_type: string()
      .oneOf(fieldTypes, formatMessage(messages.answerFormatError))
      .required(formatMessage(messages.answerFormatError)),
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldNameError)
    ),
    description_multiloc: object(),
    required: boolean().required(),
  });
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const inputTypeOptions = () => {
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: formatMessage(messages[`fieldType_${inputType}`]),
    }));
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <Section>
          <SectionField>
            <Feedback
              successMessage={formatMessage(messages.saveFieldSuccess)}
            />
            <Select
              name="input_type"
              options={inputTypeOptions()}
              label={formatMessage(messages.answerFormat)}
              disabled={mode === 'edit' || builtInField}
            />
          </SectionField>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldName)}
              name="title_multiloc"
              disabled={builtInField}
            />
          </SectionField>
          <SectionField>
            <TextAreaMultilocWithLocaleSwitcher
              name="description_multiloc"
              label={formatMessage(messages.fieldDescription)}
              disabled={builtInField}
            />
          </SectionField>
          <SectionField>
            <Toggle
              name="required"
              label={formatMessage(messages.isFieldRequired)}
            />
          </SectionField>
        </Section>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveField)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(RegistrationCustomFieldForm);
