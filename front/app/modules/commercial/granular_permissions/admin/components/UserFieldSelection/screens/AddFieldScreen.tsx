import React from 'react';

// components
import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';
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
import { fieldTypes } from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';
import ChoiceList from 'components/HookForm/ChoiceList';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// intls
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';
import { addCustomFieldForUsers } from 'services/userCustomFields';

type AddFieldScreenProps = {
  setShowAddFieldPage: (show: boolean) => void;
  defaultValues?: Partial<FormValues>;
};

export interface FormValues {
  input_type?: string;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export const AddFieldScreen = ({
  setShowAddFieldPage,
  defaultValues,
}: AddFieldScreenProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  const schema = object({
    question_choices: validateOneOptionForMultiSelect(
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
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: formatMessage(messages[`fieldType_${inputType}`]),
    }));
  };

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      const newField = await addCustomFieldForUsers({
        ...formValues,
      });
      if (newField.data.id) {
        setShowAddFieldPage(false);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  if (isNilOrError(locale) || isNilOrError(locales)) {
    return null;
  }

  return (
    <>
      <Box mb="20px">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.createAQuestion} />
        </Title>
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
                  options={inputTypeOptions()}
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
                  <ChoiceList
                    name={'question_choices'}
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
                  type="submit"
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
