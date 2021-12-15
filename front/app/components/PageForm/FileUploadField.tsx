import React from 'react';
import { v4 as uuidv4 } from 'uuid';

// components
import FormikFileUploader from 'components/UI/FormikFileUploader';
import { SectionField } from 'components/admin/Section';
import { Label, IconTooltip } from 'cl2-component-library';
import { Field, FieldProps } from 'formik';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const renderFileUploader = (pageId: string | null) => (props: FieldProps) => {
  return (
    <FormikFileUploader
      id={uuidv4()}
      resourceId={pageId}
      resourceType="page"
      {...props}
    />
  );
};

interface Props {
  pageId: string | null;
}

export default ({ pageId }: Props) => (
  <SectionField>
    <Label>
      <FormattedMessage {...messages.fileUploadLabel} />
      <IconTooltip
        content={<FormattedMessage {...messages.fileUploadLabelTooltip} />}
      />
    </Label>
    <Field name="local_page_files" render={renderFileUploader(pageId)} />
  </SectionField>
);
