import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React, { useCallback, useState } from 'react';
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
  const [didBlur, setDidBlur] = useState(false);
  const options = schema?.oneOf?.map((o) => ({
    value: o.const,
    label: o.title || o.const,
  }));

  console.log('data: ', data);
  console.log('options: ', options);
  console.log('path: ', path);
  console.log('ui schema: ', uischema);
  console.log('json schema: ', schema);

  const onChange = useCallback(
    (value: string) => {
      handleChange(path, value);
    },
    [handleChange, path]
  );

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
        <Label value={'Label before'} />
        {/* {options?.map((item) => (
          <>
            <Box style={{ lineHeight: '0px' }}>
              <Label value={item.label} />
              <br />
              <Radio
                name="linear_scale"
                currentValue={data}
                value={item.value}
                key={item.label}
                id={item.label}
                label={''}
                onChange={onChange}
              />
            </Box>
          </>
        ))} */}
        <Label value={'Label after'} />
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(LinearScaleControl);

export const linearScaleControlTester: RankedTester = rankWith(
  10,
  scopeEndsWith('linear_scale')
);
