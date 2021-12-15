import React from 'react';
import styled from 'styled-components';

// components
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import { SectionField } from 'components/admin/Section';
import { Field, FieldProps, FormikErrors } from 'formik';
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

const StyledFormikQuillMultiloc = styled(FormikQuillMultiloc)`
  max-width: 540px;
`;

const renderQuill = (pageId: string) => (props: FieldProps) => {
  return (
    <StyledFormikQuillMultiloc
      label={<FormattedMessage {...messages.editContent} />}
      id={`${pageId}-${props.field.name}`}
      withCTAButton
      valueMultiloc={props.field.value}
      {...props}
    />
  );
};

interface Props {
  error: FormikErrors<Multiloc>;
  pageId: string;
}

export default ({ error, pageId }: Props) => (
  <SectionField>
    <Field name="body_multiloc" render={renderQuill(pageId)} />
    {error && (
      <Error
        fieldName="body_multiloc"
        text={formatMessage(messages.emptyDescriptionError)}
      />
    )}
  </SectionField>
);
