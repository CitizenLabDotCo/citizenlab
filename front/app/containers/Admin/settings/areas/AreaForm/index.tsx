import React from 'react';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Section, SectionField } from 'components/admin/Section';
import { Box, Button } from '@citizenlab/cl2-component-library';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';

// typings
import { Multiloc } from 'typings';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

export interface FormValues {
  title_multiloc: Multiloc;
}

type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
} & WrappedComponentProps;

const AreaForm = ({
  intl: { formatMessage },
  defaultValues,
  onSubmit,
}: Props) => {
  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldTitleError)
    ),
    description_multiloc: object(),
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
      <Section data-testid="areaForm">
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <SectionField>
            <Feedback />
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.fieldTitle)}
              name="title_multiloc"
              labelTooltipText={formatMessage(messages.fieldTitleTooltip)}
            />
          </SectionField>
          <Box display="flex">
            <Button
              type="submit"
              processing={methods.formState.isSubmitting}
              data-testid="saveArea"
            >
              {formatMessage(messages.saveArea)}
            </Button>
          </Box>
        </form>
      </Section>
    </FormProvider>
  );
};

export default injectIntl(AreaForm);
