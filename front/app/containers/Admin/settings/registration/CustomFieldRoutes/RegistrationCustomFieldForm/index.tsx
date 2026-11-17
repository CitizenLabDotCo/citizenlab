import React from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import { Multiloc } from 'typings';
import { object, boolean, string } from 'yup';

import { IUserCustomFieldInputType } from 'api/user_custom_fields/types';

import { Section, SectionField } from 'components/admin/Section';
import CharacterLimitSettings from 'components/FormBuilder/components/FormBuilderSettings/CharacterLimitSettings';
import { nullableNumber } from 'components/FormBuilder/edit/utils';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

import { injectIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

export interface FormValues {
  enabled: boolean;
  input_type: IUserCustomFieldInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
  min_characters: number | null | undefined;
  max_characters: number | null | undefined;
}

type Props = {
  mode: 'new' | 'edit';
  customFieldId?: string;
  builtInField: boolean;
  defaultValues?: FormValues;
  onSubmit: (formValues: FormValues) => void | Promise<void>;
} & WrappedComponentProps;

export const fieldTypes = [
  'select',
  'multiselect',
  'checkbox',
  'text',
  'multiline_text',
  'number',
  'date',
] as const;

export const fieldTypeValidator = string().oneOf(fieldTypes);

export type FieldType = (typeof fieldTypes)[number];

const supportsCharacterLimits = (inputType?: IUserCustomFieldInputType) =>
  inputType === 'text' || inputType === 'multiline_text';

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
      formatMessage(messages.questionNameError)
    ),
    description_multiloc: object(),
    required: boolean().required(),
    // The inputs' own min attributes keep max above min.
    min_characters: nullableNumber,
    max_characters: nullableNumber,
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

  const inputType = methods.watch('input_type');
  const showCharacterLimits =
    !builtInField && supportsCharacterLimits(inputType);

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      // Only text questions have character limits; leave them out for the
      // other types so a limit typed before switching type isn't stored.
      await onSubmit(
        supportsCharacterLimits(formValues.input_type)
          ? formValues
          : {
              ...formValues,
              min_characters: undefined,
              max_characters: undefined,
            }
      );
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
              successMessage={formatMessage(messages.saveQuestionSuccess)}
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
              label={formatMessage(messages.questionName)}
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
              label={formatMessage(messages.isQuestionRequired)}
            />
          </SectionField>
          {showCharacterLimits && (
            <SectionField>
              <CharacterLimitSettings
                minCharactersName="min_characters"
                maxCharactersName="max_characters"
              />
            </SectionField>
          )}
        </Section>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.saveQuestion)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(RegistrationCustomFieldForm);
