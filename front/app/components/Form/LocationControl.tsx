import React, { useState } from 'react';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, LocationInput } from 'cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { FormLabelStyled } from 'components/UI/FormComponents';
import ErrorDisplay from './ErrorDisplay';
import Error from 'components/UI/Error';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const LocationControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  intl: { formatMessage },
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

  if (window.google) {
    // TODO move to LocationInput
    return (
      <Box id="e2e-idea-location-input" width="100%" marginBottom="40px">
        <FormLabelStyled>{uischema.label}</FormLabelStyled>
        <LocationInput
          className="e2e-initiative-location-input"
          value={data}
          onChange={(location) => handleChange(path, location)}
          placeholder={''}
          onBlur={() => setDidBlur(true)}
        />
        <ErrorDisplay
          ajvErrors={didBlur ? errors : undefined}
          fieldPath={path}
        />
      </Box>
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
