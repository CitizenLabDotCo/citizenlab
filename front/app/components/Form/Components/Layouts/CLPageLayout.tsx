import React, { memo } from 'react';
import {
  and,
  //   Categorization,
  isCategorization,
  Layout,
  LayoutProps,
  RankedTester,
  rankWith,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import { Box, fontSizes, media } from '@citizenlab/cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import styled from 'styled-components';
import { FormElement } from 'components/IdeaForm';
import isEmpty from 'lodash/isEmpty';

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

export interface PageType extends Layout {
  type: 'Page';
  /**
   * The label associated with this category layout.
   */
  label: string;
}
/**
 * The categorization element, which may have children elements.
 * A child element may either be itself a Categorization or a Category, hence
 * the categorization element can be used to represent recursive structures like trees.
 */
export interface PageCategorization extends UISchemaElement {
  type: 'Categorization';
  /**
   * The label of this categorization.
   */
  label: string;
  /**
   * The child elements of this categorization which are either of type
   * {@link PageType} or {@link PageCategorization}.
   */
  elements: (PageType | PageCategorization)[];
}

const CLPageLayout = memo(
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
        {(uischema as PageCategorization).elements.map((e, index) => (
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

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(
  1,
  and(uiTypeIs('Categorization'), (uischema) => {
    const hasCategory = (element: PageCategorization): boolean => {
      if (isEmpty(element.elements)) {
        return false;
      }

      return element.elements
        .map((elem) =>
          isCategorization(elem) ? hasCategory(elem) : elem.type === 'Page'
        )
        .reduce((prev, curr) => prev && curr, true);
    };

    return hasCategory(uischema as PageCategorization);
  })
);
