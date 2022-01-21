import React, { useState } from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { LocationInput } from 'cl2-component-library';
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
  id,
  required,
  intl: { formatMessage },
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  if (window.google) {
    return (
      <>
        <FormLabel
          htmlFor={id}
          labelValue={getLabel(uischema, schema, path)}
          optional={!required}
          subtextValue={schema.description}
          subtextSupportsHtml
        />
        <LocationInput
          value={data}
          onChange={(location) => handleChange(path, location)}
          placeholder={''}
          onBlur={() => setDidBlur(true)}
        />
        <ErrorDisplay
          ajvErrors={didBlur ? errors : undefined}
          fieldPath={path}
        />
      </>
    );
  } else {
    return <Error text={formatMessage(messages.locationGoogleUnavailable)} />;
  }
};

export default withJsonFormsControlProps(injectIntl(LocationControl));

export const locationControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('location_description')
);
