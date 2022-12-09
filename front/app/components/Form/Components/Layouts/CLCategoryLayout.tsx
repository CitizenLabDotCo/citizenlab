import React, { memo } from 'react';
import {
  Categorization,
  isCategorization,
  LayoutProps,
  rankWith,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import { Box, fontSizes, media } from '@citizenlab/cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import styled from 'styled-components';
import { FormElement } from 'components/IdeaForm';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;

  ${media.phone`
    padding-left: 25px;
    padding-right: 25px;
  `}

  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

const FormSectionTitleStyled = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
  margin-bottom: 30px;
`;

const CLCategoryLayout = memo(
  // here we can cast types because the tester made sure we only get categorization layouts
  ({ schema, uischema, path, renderers, cells, enabled }: LayoutProps) => {
    return (
      <Box
        width="100%"
        maxWidth="700px"
        display="flex"
        flexDirection="column"
        padding="0 20px 30px 20px"
        margin="auto"
      >
        {(uischema as Categorization).elements.map((e, index) => (
          <StyledFormSection key={index}>
            <FormSectionTitleStyled>{e.label}</FormSectionTitleStyled>
            {e.elements.map((e, index) => (
              <FormElement key={index}>
                <JsonFormsDispatch
                  renderers={renderers}
                  cells={cells}
                  uischema={e}
                  schema={schema}
                  path={path}
                  enabled={enabled}
                />
              </FormElement>
            ))}
          </StyledFormSection>
        ))}
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const clCategoryTester = rankWith(3, isCategorization);
