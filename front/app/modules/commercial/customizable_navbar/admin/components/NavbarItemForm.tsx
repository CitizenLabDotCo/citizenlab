import React from 'react';

// typings
import { Multiloc } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';
import useToast from 'components/Toast/useToast';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
} & InjectedIntlProps;

const NavbarItemForm = ({
  onSubmit,
  defaultValues,
  intl: { formatMessage },
}: PageFormProps) => {
  const { add } = useToast();
  const schema = object({
    nav_bar_item_title_multiloc: validateMultiloc(
      formatMessage(messages.emptyNavbarItemTitleError)
    ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
      add({ variant: 'success', text: 'Page successfully saved' });
    } catch (error) {
      Object.keys(error.json.errors).forEach((key: keyof FormValues) => {
        methods.setError(key, error.json.errors[key][0]);
      });

      add({
        variant: 'error',
        text: 'There is a problem - please fix the issues shown and try again.',
      });
    }
  };

  const onValidationError = () => {
    add({
      variant: 'error',
      text: 'There is a problem - please fix the issues shown and try again.',
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onValidationError)}>
        <SectionField>
          <RHFInputMultilocWithLocaleSwitcher
            name="nav_bar_item_title_multiloc"
            label={formatMessage(messages.navbarItemTitle)}
            type="text"
          />
        </SectionField>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.save)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(NavbarItemForm);
