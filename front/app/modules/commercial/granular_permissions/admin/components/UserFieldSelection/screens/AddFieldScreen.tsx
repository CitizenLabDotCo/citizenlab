import React from 'react';

// components
import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

// hook form
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Feedback from 'components/HookForm/Feedback';
import validateMultiloc from 'utils/yup/validateMultilocForEveryLocale';

// intls
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';
import { Multiloc } from 'typings';
import Select from 'components/HookForm/Select';
import { fieldTypes } from 'containers/Admin/settings/registration/CustomFieldRoutes/RegistrationCustomFieldForm';
import SelectionChoiceSetup from 'components/HookForm/SelectionChoiceSetup';
import useAppConfiguration from 'api/app_configuration/__mocks__/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

type AddFieldScreenProps = {
  setShowAddFieldPage: (show: boolean) => void;
};

export interface FormValues {
  question_type: string;
  question_title_multiloc: Multiloc;
  question_description_multiloc: Multiloc;
}

export const AddFieldScreen = ({
  setShowAddFieldPage,
}: AddFieldScreenProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const locales = useAppConfigurationLocales();

  const schema = object({
    question_type: string().required(formatMessage(messages.selectValueError)),
    question_title_multiloc: validateMultiloc(
      formatMessage(messages.missingTitleLocaleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {},
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
      console.log({ formValues });
      //   await onSubmit(formValues);
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
                  name="question_type"
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
                  name="question_title_multiloc"
                  label={
                    <>
                      <Text my="0px" color="primary" fontWeight="bold">
                        Question title
                      </Text>
                    </>
                  }
                  type="text"
                />
              </SectionField>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  name="question_description_multiloc"
                  label={
                    <>
                      <Text my="0px" color="primary" fontWeight="bold">
                        Question description
                      </Text>
                    </>
                  }
                  type="text"
                />
              </SectionField>
              <SectionField>
                <SelectionChoiceSetup
                  name={'question_choices'}
                  locales={locales}
                  platformLocale={locale}
                />
              </SectionField>
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
