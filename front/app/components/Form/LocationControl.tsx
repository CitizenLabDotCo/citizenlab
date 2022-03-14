import React, { useState } from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { LocationInput } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from './ErrorDisplay';
import Error from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { getLabel } from 'utils/JSONFormUtils';

const LocationControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  intl: { formatMessage },
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <FormLabel
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      {window.google ? (
        <LocationInput
          value={data}
          onChange={(location) => handleChange(path, location)}
          placeholder={''}
          onBlur={() => setDidBlur(true)}
          aria-label={getLabel(uischema, schema, path)}
        />
      ) : (
        <Error text={formatMessage(messages.locationGoogleUnavailable)} />
      )}
      <ErrorDisplay didBlur={didBlur} ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(LocationControl));

export const locationControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('location_description')
);
