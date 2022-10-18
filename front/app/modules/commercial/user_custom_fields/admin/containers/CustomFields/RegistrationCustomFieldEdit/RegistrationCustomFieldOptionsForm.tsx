import React from 'react';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import { Box } from '@citizenlab/cl2-component-library';

// form
import { FormProvider, useForm } from 'react-hook-form';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// Typings
import { Multiloc } from 'typings';
import { useParams } from 'react-router-dom';

export interface FormValues {
  title_multiloc: Multiloc;
}

type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
} & WrappedComponentProps;

const RegistrationCustomFieldOptionsForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
}: Props) => {
  const { userCustomFieldId } = useParams() as { userCustomFieldId: string };
  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.answerOptionError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="customFieldsOptionsForm"
      >
        <SectionField>
          <Feedback
            successMessage={formatMessage(messages.answerOptionSuccess)}
          />
          <InputMultilocWithLocaleSwitcher
            name="title_multiloc"
            label={formatMessage(messages.answerOption)}
            type="text"
          />
        </SectionField>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.answerOptionSave)}
          </Button>
        </Box>

        <Box display="flex" alignItems="center">
          <Button
            buttonStyle="text"
            linkTo={`/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`}
          >
            {formatMessage(messages.optionCancelButton)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(RegistrationCustomFieldOptionsForm);
