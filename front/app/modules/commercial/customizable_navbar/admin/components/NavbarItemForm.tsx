import React from 'react';
import { InjectedFormikProps, FormikErrors } from 'formik';

// components
import NavbarTitleField from './NavbarTitleField';
import BasePageForm from 'components/PageForm/BasePageForm';

// typings
import { Multiloc, Locale } from 'typings';

// utils
import { validateMultiloc } from 'components/PageForm/fields/validate';

export interface FormValues {
  nav_bar_item_title_multiloc: Multiloc;
}

export interface Props {}

export function validatePageForm(appConfigurationLocales: Locale[]) {
  return function ({
    nav_bar_item_title_multiloc,
  }: FormValues): FormikErrors<FormValues> {
    const errors: FormikErrors<FormValues> = {};

    const error = validateMultiloc(
      nav_bar_item_title_multiloc,
      appConfigurationLocales
    );

    error && (errors.nav_bar_item_title_multiloc = error);

    return errors;
  };
}

const NavbarItemForm = ({
  errors,
  ...props
}: InjectedFormikProps<Props, FormValues>) => (
  <BasePageForm errors={errors} {...props}>
    <NavbarTitleField error={errors.nav_bar_item_title_multiloc} />
  </BasePageForm>
);

export default NavbarItemForm;
