import React from 'react';

// components
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import { Field, FieldProps, FormikErrors } from 'formik';
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { Multiloc } from 'typings';

const renderFormikInputMultilocWithLocaleSwitcher = (props: FieldProps) => {
  return (
    <FormikInputMultilocWithLocaleSwitcher
      {...props}
      label={<FormattedMessage {...messages.pageTitle} />}
    />
  );
};

interface Props {
  error?: FormikErrors<Multiloc>;
}

export default ({ error }: Props) => (
  <SectionField>
    <Field
      name="title_multiloc"
      render={renderFormikInputMultilocWithLocaleSwitcher}
    />
    {error && (
      <Error
        fieldName="title_multiloc"
        text={<FormattedMessage {...messages.emptyTitleError} />}
      />
    )}
  </SectionField>
);
