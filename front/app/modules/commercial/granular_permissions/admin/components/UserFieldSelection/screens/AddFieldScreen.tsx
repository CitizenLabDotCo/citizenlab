import React from 'react';

// components
import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import { SectionField } from 'components/admin/Section';

// hook form
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Feedback from 'components/HookForm/Feedback';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';
import Select from 'components/HookForm/Select';
import {
  FieldType,
  fieldTypes,
} from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';
import OptionList, { Option } from 'components/HookForm/OptionList';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// intls
import { useIntl } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';
import { addCustomFieldForUsers } from 'services/userCustomFields';
import { getLabelForInputType } from '../../../containers/Granular/utils';
import { addUserCustomFieldOption } from 'services/userCustomFieldOptions';

type AddFieldScreenProps = {
  setShowAddFieldPage: (show: boolean) => void;
  defaultValues?: Partial<FormValues>;
};

export interface FormValues {
  input_type?: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  question_options: Option[];
}

export const AddFieldScreen = ({
  setShowAddFieldPage,
  defaultValues,
}: AddFieldScreenProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  const schema = object({
    question_options: validateOneOptionForMultiSelect(
      formatMessage(messages.atLeastOneOptionError)
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
    try {
      const newField = await addCustomFieldForUsers({
        ...formValues,
      });
      if (newField.data.id) {
        formValues?.question_options?.forEach(async (option) => {
          await addUserCustomFieldOption(newField.data.id, {
            title_multiloc: option.title_multiloc,
          });
        });

        setShowAddFieldPage(false);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
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
                  type="text"
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
                  type="text"
                />
              </SectionField>
              {(inputType === 'select' || inputType === 'multiselect') && (
                <SectionField>
                  <OptionList
                    name={'question_options'}
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
