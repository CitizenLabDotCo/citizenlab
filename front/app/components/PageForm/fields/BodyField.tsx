import React from 'react';

// components
import { SectionFieldPageContent } from 'components/admin/Section';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import { Field, FieldProps, FormikErrors } from 'formik';
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { Multiloc } from 'typings';

const renderQuill = (pageId: string | null) => (props: FieldProps) => {
  return (
    <FormikQuillMultiloc
      label={<FormattedMessage {...messages.editContent} />}
      id={`${pageId}-${props.field.name}`}
      withCTAButton
      valueMultiloc={props.field.value}
      {...props}
    />
  );
};

interface Props {
  error?: FormikErrors<Multiloc>;
  pageId: string | null;
}

export default ({ error, pageId }: Props) => (
  <SectionFieldPageContent>
    <Field name="body_multiloc" render={renderQuill(pageId)} />
    {error && (
      <Error
        fieldName="body_multiloc"
        text={<FormattedMessage {...messages.emptyDescriptionError} />}
      />
    )}
  </SectionFieldPageContent>
);
