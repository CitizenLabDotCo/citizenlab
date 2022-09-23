import React from 'react';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import Button from 'components/UI/Button';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { FormProvider, useForm } from 'react-hook-form';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultiloc from 'utils/yup/validateMultiloc';
import { object } from 'yup';

// Typings
import { useParams } from 'react-router-dom';
import { Multiloc } from 'typings';

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
    title_multiloc: validateMultiloc(formatMessage(messages.answerOptionError)),
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
