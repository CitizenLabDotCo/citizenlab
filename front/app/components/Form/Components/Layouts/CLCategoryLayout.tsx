import React, { memo } from 'react';

import { Box, fontSizes, media } from '@citizenlab/cl2-component-library';
import {
  Categorization,
  isCategorization,
  LayoutProps,
  rankWith,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import {
  extractElementsByOtherOptionLogic,
  hasOtherTextFieldBelow,
} from 'components/Form/Components/Controls/visibilityUtils';
import { FormSection } from 'components/UI/FormComponents';
import QuillEditedContent from 'components/UI/QuillEditedContent';

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
  ({
    schema,
    uischema,
    path,
    renderers,
    cells,
    enabled,
    data,
  }: LayoutProps) => {
    const theme = useTheme();

    return (
      <Box
        width="100%"
        maxWidth="700px"
        display="flex"
        flexDirection="column"
        padding="0 20px 30px 20px"
        margin="auto"
      >
        {(uischema as Categorization).elements.map((e, index) => {
          const elements = extractElementsByOtherOptionLogic(e, data);
          return (
            <StyledFormSection key={index}>
              <FormSectionTitleStyled>{e.label}</FormSectionTitleStyled>
              {e.options && e.options.description && (
                <Box mb={e.elements.length >= 1 ? '48px' : '28px'}>
                  <QuillEditedContent
                    fontWeight={400}
                    textColor={theme.colors.tenantText}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: e.options.description,
                      }}
                    />
                  </QuillEditedContent>
                </Box>
              )}
              {elements.map((elementUiSchema, index) => {
                const hasOtherFieldBelow = hasOtherTextFieldBelow(
                  elementUiSchema,
                  data
                );

                return (
                  <Box
                    w="100%"
                    mb={hasOtherFieldBelow ? '15px' : '40px'}
                    key={index}
                  >
                    <JsonFormsDispatch
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
            </StyledFormSection>
          );
        })}
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const clCategoryTester = rankWith(3, isCategorization);
