import React, { memo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';

import {
  extractElementsByOtherOptionLogic,
  hasOtherTextFieldBelow,
} from 'components/Form/Components/Controls/visibilityUtils';

const CLCategoryLayout = memo(
  ({ schema, uischema, path, renderers, cells, enabled, data }: any) => {
    const elements = extractElementsByOtherOptionLogic(uischema, data);
    return (
      <Box margin-bottom="30px" width="100%">
        {elements.map((elementUiSchema, index) => {
          const hasOtherFieldBelow = hasOtherTextFieldBelow(
            elementUiSchema,
            data
          );
          return (
            <Box
              width="100%"
              mb={hasOtherFieldBelow ? undefined : '28px'}
              key={index}
            >
              <JsonFormsDispatch
                key={index}
                renderers={renderers}
                cells={cells}
                uischema={elementUiSchema}
                schema={schema}
                path={path}
                enabled={enabled}
              />
            </Box>
          );
        })}
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const orderedLayoutTester = rankWith(3, uiTypeIs('VerticalLayout'));
