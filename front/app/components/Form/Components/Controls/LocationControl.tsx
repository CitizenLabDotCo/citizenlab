import React, { useState } from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import LocationInput, { Option } from 'components/UI/LocationInput';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../ErrorDisplay';
import { WrappedComponentProps } from 'react-intl';
import { getLabel } from 'utils/JSONFormUtils';
import { getSubtextElement } from './controlUtils';

const LocationControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  visible,
}: ControlProps & WrappedComponentProps) => {
  const [didBlur, setDidBlur] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />

      <LocationInput
        value={{
          value: data || '',
          label: data || '',
        }}
        onChange={(location: Option) => {
          handleChange(
            path,
            location.value === '' ? undefined : location.value
          );
        }}
        placeholder={''}
        onBlur={() => setDidBlur(true)}
        aria-label={getLabel(uischema, schema, path)}
        className="e2e-idea-form-location-input-field"
      />

      <ErrorDisplay didBlur={didBlur} ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(LocationControl);

export const locationControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('location_description')
);
