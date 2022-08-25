import React from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { Form } from 'formik';

import { Section, SectionField } from 'components/admin/Section';

// typings
import { Multiloc } from 'typings';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';

// form
import { FormProvider, useForm } from 'react-hook-form';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Feedback from 'components/HookForm/Feedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

export interface FormValues {
  title_multiloc: Multiloc;
}

type Props = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
} & InjectedIntlProps;

const TopicForm = ({
  intl: { formatMessage },
  onSubmit,
  defaultValues,
}: Props) => {
  const schema = object({
    title_multiloc: validateMultiloc('error'),
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
    <Form>
      <Section>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onFormSubmit)}>
            <SectionField>
              <Feedback />
              <InputMultilocWithLocaleSwitcher
                name="title_multiloc"
                label={formatMessage(messages.fieldTopicTitle)}
                labelTooltipText={formatMessage(
                  messages.fieldTopicTitleTooltip
                )}
                type="text"
              />
            </SectionField>
            <Box display="flex">
              <Button type="submit" processing={methods.formState.isSubmitting}>
                save
              </Button>
            </Box>
          </form>
        </FormProvider>
      </Section>
    </Form>
  );
};

export default injectIntl<Props>(TopicForm);
