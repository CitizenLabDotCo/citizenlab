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
import ErrorDisplay from '../ErrorDisplay';
import Error from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { getLabel } from 'utils/JSONFormUtils';
import messages from '../../messages';
import { getSubtextElement } from './controlUtils';

const LocationControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  intl: { formatMessage },
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
