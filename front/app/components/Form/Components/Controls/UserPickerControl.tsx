import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormLabel } from 'components/UI/FormComponents';
import UserSelect from 'components/UI/UserSelect';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import messages from '../../messages';
import ErrorDisplay from '../ErrorDisplay';

const UserPickerControl = ({
  data,
  handleChange,
  path,
  errors,
  uischema,
  intl: { formatMessage },
  id,
  schema,
  required,
}: ControlProps & WrappedComponentProps) => {
  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <UserSelect
        inputId={sanitizeForClassname(id)}
        value={data}
        onChange={(val) => handleChange(path, val)}
        placeholder={formatMessage(messages.userPickerPlaceholder)}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(UserPickerControl));

export const userPickerControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('author_id')
);
