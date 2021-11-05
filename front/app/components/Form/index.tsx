import React, { memo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import MultilocInputLayout, {
  multilocInputTester,
} from './MultilocInputLayout';
import InputControl, { inputControlTester } from './InputControl';
import CLCategoryLayout, { clCategoryTester } from './CLCategoryLayout';

// import { createAjv } from '@jsonforms/core';
//
// const handleDefaultsAjv = createAjv({useDefaults: true});
//
// handleDefaultsAjv.addKeyword('multiloc', { compile: function(schema) {
//   return function(data) {
//     console.log(data, schema)
//   return false
//   };
// } });

interface Props {
  schema: any;
  uiSchema: any;
  onSubmit: (formData) => void;
  initialFormData?: any;
}
const renderers = [
  { tester: multilocInputTester, renderer: MultilocInputLayout },
  { tester: inputControlTester, renderer: InputControl },
  { tester: clCategoryTester, renderer: CLCategoryLayout },
];

export default memo(({ schema, uiSchema, initialFormData }: Props) => {
  const [data, setData] = useState(initialFormData);
  console.log(data);
  return (
    <Box>
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={data}
        renderers={renderers}
        onChange={({ data }) => {
          console.log(data);
          setData(data);
        }}
      />
    </Box>
  );
});
