import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React from 'react';
import ErrorDisplay from '../ErrorDisplay';
import { Box, Label, Radio } from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import VerificationIcon from '../VerificationIcon';

const LinearScaleControl = ({
  data,
  path,
  errors,
  schema,
  uischema,
  required,
  handleChange,
  id,
}: ControlProps) => {
  const maximum = schema?.properties?.rating?.maximum;

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" gap="8px" overflow="visible">
        <Label value={uischema.options?.minimum_label} />
        <>
          {[...Array(maximum)].map((x, i) => (
            <Box key={i} style={{ lineHeight: '0px' }}>
              <Label value={(i + 1).toString()} />
              <br />
              <Radio
                name="linear_scale"
                currentValue={data?.rating}
                value={i + 1}
                key={i}
                id={x}
                onChange={(value) => handleChange(path, { rating: value })}
              />
            </Box>
          ))}
        </>
        <Label value={uischema.options?.maximum_label} />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={false} />
    </>
  );
};

export default withJsonFormsControlProps(LinearScaleControl);

export const linearScaleControlTester: RankedTester = rankWith(
  10,
  scopeEndsWith('linear_scale')
);
