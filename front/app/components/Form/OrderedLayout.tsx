import React, { memo } from 'react';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import {
  ResolvedJsonFormsDispatch,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { SectionField } from 'components/admin/Section';
import { Box } from 'cl2-component-library';

const CLCategoryLayout = memo(
  ({ schema, uischema, path, renderers, cells, enabled }: any) => {
    return (
      <Box margin-bottom="30px" width="100%">
        {uischema.elements.map((e, index) => {
          if (e.options.hidden) return null;
          return (
            <SectionField marginBottom="30px" key={index}>
              <ResolvedJsonFormsDispatch
                key={index}
                renderers={renderers}
                cells={cells}
                uischema={e}
                schema={schema}
                path={path}
                enabled={enabled}
              />
            </SectionField>
          );
        })}
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const orderedLayoutTester = rankWith(3, uiTypeIs('VerticalLayout'));
