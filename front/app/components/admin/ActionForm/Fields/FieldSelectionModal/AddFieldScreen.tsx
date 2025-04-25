import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { object, string } from 'yup';

import useAddCustomFieldOption from 'api/custom_field_options/useAddCustomFieldOption';
import { IOptionsType } from 'api/custom_fields/types';
import useAddUserCustomField from 'api/user_custom_fields/useAddUserCustomField';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { getLabelForInputType } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';
import {
  FieldType,
  fieldTypes,
} from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import OptionList from 'components/HookForm/OptionList';
import Select from 'components/HookForm/Select';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';

import messages from './messages';

type AddFieldScreenProps = {
  setShowAddFieldPage: (show: boolean) => void;
  defaultValues?: Partial<FormValues>;
};

export interface FormValues {
  input_type?: FieldType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  options: IOptionsType[];
}

export const AddFieldScreen = ({
  setShowAddFieldPage,
  defaultValues,
}: AddFieldScreenProps) => {
  const { mutateAsync: addCustomFieldOption } = useAddCustomFieldOption();
  const { mutateAsync: addCustomFieldForUsers } = useAddUserCustomField();
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  const schema = object({
    options: validateOneOptionForMultiSelect(
      formatMessage(messages.atLeastOneOptionError),
      formatMessage(messages.emptyTitleErrorMessage)
    ),
    input_type: string().required(formatMessage(messages.selectValueError)),
    title_multiloc: validateMultiloc(
      formatMessage(messages.missingTitleLocaleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const inputType = methods.watch('input_type');

  const inputTypeOptions = () => {
    return fieldTypes.map((inputType: FieldType) => ({
      value: inputType,
      label: formatMessage(getLabelForInputType(inputType)),
    }));
  };

  const onFormSubmit = async (formValues: Partial<FormValues>) => {
    methods.trigger().then(async (isValid) => {
      if (isValid) {
        try {
          const newField = await addCustomFieldForUsers({
            ...formValues,
            enabled: false,
          });

          if (
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (newField.data.id && formValues?.input_type === 'multiselect') || // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            formValues?.input_type === 'select'
          ) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            formValues?.options?.forEach(async (option) => {
              await addCustomFieldOption({
                customFieldId: newField.data.id,
                title_multiloc: option.title_multiloc,
              });
            });
          }
          setShowAddFieldPage(false);
        } catch (error) {
          handleHookFormSubmissionError(error, methods.setError);
        }
      }
    });
  };

  if (isNilOrError(locale) || isNilOrError(locales)) {
    return null;
  }

  const fieldOptions = inputTypeOptions();

  return (
    <>
      <Box my="20px" mx="20px">
        <GoBackButton
          onClick={() => {
            setShowAddFieldPage(false);
          }}
        />
        <Box mt="16px">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onFormSubmit)}>
              <Feedback successMessage={'Success Message'} />
              <SectionField>
                <Select
                  name="input_type"
                  options={fieldOptions}
                  label={
                    <>
                      <Text my="0px" color="primary" fontWeight="bold">
                        {formatMessage(messages.answerFormat)}
                      </Text>
                    </>
                  }
                />
              </SectionField>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  name="title_multiloc"
                  label={
                    <>
                      <Text my="0px" color="primary" fontWeight="bold">
                        {formatMessage(messages.questionTitle)}
                      </Text>
                    </>
                  }
                />
              </SectionField>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  name="description_multiloc"
                  label={
                    <>
                      <Text my="0px" color="primary" fontWeight="bold">
                        {formatMessage(messages.questionDescription)}
                      </Text>
                    </>
                  }
                />
              </SectionField>
              {(inputType === 'select' || inputType === 'multiselect') && (
                <SectionField>
                  <OptionList
                    name={'options'}
                    locales={locales}
                    platformLocale={locale}
                    fieldLabel={
                      <Text my="0px" color="primary" fontWeight="bold">
                        {formatMessage(messages.answerChoices)}
                      </Text>
                    }
                    addButtonLabel={
                      <Text my="0px" color="primary" fontWeight="bold">
                        {formatMessage(messages.addAnswer)}
                      </Text>
                    }
                  />
                </SectionField>
              )}
              <Box display="flex">
                <Button
                  type="button"
                  onClick={() => onFormSubmit(methods.getValues())}
                  processing={methods.formState.isSubmitting}
                >
                  {formatMessage(messages.createAQuestion)}
                </Button>
              </Box>
            </form>
          </FormProvider>
        </Box>
      </Box>
    </>
  );
};
