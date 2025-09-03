import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import { Multiloc } from 'typings';
import { object } from 'yup';

import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from './messages';

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
} & WrappedComponentProps;

const NavbarItemForm = ({
  onSubmit,
  defaultValues,
  intl: { formatMessage },
}: PageFormProps) => {
  const schema = object({
    nav_bar_item_title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.emptyTitleError)
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
        data-testid="navbarItemForm"
      >
        <SectionField>
          <Feedback
            successMessage={formatMessage(messages.savePageSuccessMessage)}
          />
          <InputMultilocWithLocaleSwitcher
            name="nav_bar_item_title_multiloc"
            label={formatMessage(messages.navbarItemTitle)}
          />
        </SectionField>
        <Box display="flex">
          <ButtonWithLink
            type="submit"
            processing={methods.formState.isSubmitting}
          >
            {formatMessage(messages.savePage)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(NavbarItemForm);
