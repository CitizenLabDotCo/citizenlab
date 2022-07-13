import React from 'react';

// typings
import { Multiloc } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import RHFInputMultilocWithLocaleSwitcher from 'components/UI/RHFInputMultilocWithLocaleSwitcher';
import { yupResolver } from '@hookform/resolvers/yup';
import RHFSubmit from 'components/UI/RHFSubmit';
import { object } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';

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
    defaultValues,
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <SectionField>
          <RHFInputMultilocWithLocaleSwitcher
            label={formatMessage(messages.navbarItemTitle)}
            type="text"
            name="nav_bar_item_title_multiloc"
          />
        </SectionField>

        <RHFSubmit />
      </form>
    </FormProvider>
  );
};

export default injectIntl(NavbarItemForm);
