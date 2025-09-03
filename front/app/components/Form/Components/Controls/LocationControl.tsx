import React, { useState } from 'react';

import { Box, Text, IconTooltip } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { WrappedComponentProps } from 'react-intl';

import { FormLabel } from 'components/UI/FormComponents';
import LocationInput, { Option } from 'components/UI/LocationInput';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

const LocationControl = ({
  uischema,
  schema,
  data,
  handleChange,
  path,
  errors,
  required,
  visible,
  id,
}: ControlProps & WrappedComponentProps) => {
  const { formatMessage } = useIntl();
  const [didBlur, setDidBlur] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <>
      <Box display="flex">
        <FormLabel
          labelValue={
            <Box display="flex">
              <Box mr="8px">{getLabel(uischema, schema, path)}</Box>
              <IconTooltip
                content={
                  <Text m="0px" fontSize="s" color="white">
                    {formatMessage(messages.validCordinatesTooltip)}
                  </Text>
                }
              />
            </Box>
          }
          optional={!required}
          subtextValue={getSubtextElement(uischema.options?.description)}
          subtextSupportsHtml
        />
      </Box>
      <LocationInput
        value={
          data
            ? {
                value: data,
                label: data,
              }
            : null
        }
        onChange={(location: Option) => {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          handleChange(path, location?.value ? location.value : undefined);
        }}
        placeholder={''}
        onBlur={() => setDidBlur(true)}
        aria-label={getLabel(uischema, schema, path)}
        className="e2e-idea-form-location-input-field"
      />

      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        didBlur={didBlur}
        ajvErrors={errors}
        fieldPath={path}
      />
    </>
  );
};

export default withJsonFormsControlProps(LocationControl);

export const locationControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('location_description')
);
