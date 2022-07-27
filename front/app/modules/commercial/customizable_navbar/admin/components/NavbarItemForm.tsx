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

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      Object.keys(error.json.errors).forEach((key: keyof FormValues) => {
        methods.setError(key, error.json.errors[key][0]);
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
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
