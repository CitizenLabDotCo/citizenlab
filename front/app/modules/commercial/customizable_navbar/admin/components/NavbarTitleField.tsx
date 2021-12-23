import React from 'react';

// services
import { MAX_TITLE_LENGTH } from 'services/navbar';

// components
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import { Field, FieldProps, FormikErrors } from 'formik';
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

const renderFormikInputMultilocWithLocaleSwitcher = (props: FieldProps) => {
  return (
    <FormikInputMultilocWithLocaleSwitcher
      {...props}
      maxCharCount={MAX_TITLE_LENGTH}
      label={<FormattedMessage {...messages.navbarItemTitle} />}
    />
  );
};

interface Props {
  error?: FormikErrors<Multiloc>;
}

export default ({ error }: Props) => (
  <SectionField>
    <Field
      name="nav_bar_item_title_multiloc"
      render={renderFormikInputMultilocWithLocaleSwitcher}
    />
    {error && (
      <Error
        fieldName="nav_bar_item_title_multiloc"
        text={<FormattedMessage {...messages.emptyNavbarItemTitleError} />}
      />
    )}
  </SectionField>
);
