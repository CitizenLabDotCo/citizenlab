import React, { memo } from 'react';
import { isCategorization, rankWith } from '@jsonforms/core';
import {
  ResolvedJsonFormsDispatch,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { Box, fontSizes, media } from 'cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import styled from 'styled-components';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;

  ${media.smallerThanMinTablet`
    padding-left: 25px;
    padding-right: 25px;
  `}

  ${media.largePhone`
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
  ({ schema, uischema, path, renderers, cells, enabled }: any) => {
    return (
      <Box
        width="100%"
        maxWidth="700px"
        display="flex"
        flexDirection="column"
        padding="0 20px 30px 20px"
        margin="auto"
      >
        {uischema.elements.map((e, index) => (
          <StyledFormSection key={index}>
            <FormSectionTitleStyled>{e.label}</FormSectionTitleStyled>
            {e.elements.map((e, index) => (
              <ResolvedJsonFormsDispatch
                key={index}
                renderers={renderers}
                cells={cells}
                uischema={e}
                schema={schema}
                path={path}
                enabled={enabled}
              />
            ))}
          </StyledFormSection>
        ))}
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLCategoryLayout);

export const clCategoryTester = rankWith(3, isCategorization);
