import React, { memo } from 'react';
import { rankWith, uiTypeIs } from '@jsonforms/core';
import {
  ResolvedJsonFormsDispatch,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { SectionField } from 'components/admin/Section';

const CLCategoryLayout = memo(
  ({ schema, uischema, path, renderers, cells, enabled }: any) => {
    return (
      <>
        {uischema.elements.map((e, index) => {
          return (
            <SectionField marginBottom="30px">
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
      </>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const orderedLayoutTester = rankWith(3, uiTypeIs('VerticalLayout'));
