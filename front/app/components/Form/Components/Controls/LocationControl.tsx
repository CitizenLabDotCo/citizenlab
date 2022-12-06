import { withJsonFormsControlProps } from '@jsonforms/react';
import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { LocationInput } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { getLabel } from 'utils/JSONFormUtils';
import { injectIntl } from 'utils/cl-intl';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import messages from '../../messages';
import ErrorDisplay from '../ErrorDisplay';

const LocationControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  intl: { formatMessage },
}: ControlProps & WrappedComponentProps) => {
  const [didBlur, setDidBlur] = useState(false);

  return (
    <>
      <FormLabel
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      {window.google ? (
        <LocationInput
          value={data}
          onChange={(location) =>
            handleChange(path, location === '' ? undefined : location)
          }
          placeholder={''}
          onBlur={() => setDidBlur(true)}
          aria-label={getLabel(uischema, schema, path)}
          className="e2e-idea-form-location-input-field"
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
  1000,
  scopeEndsWith('location_description')
);
