import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

const PageTitle = ({ page }: { page: IFlatCustomField }) => {
  const localize = useLocalize();
  const isMobileOrSmaller = useBreakpoint('phone');
  const theme = useTheme();
  return (
    <>
      <Title
        as="h1"
        variant={isMobileOrSmaller ? 'h2' : 'h1'}
        m="0"
        mb="20px"
        color="tenantPrimary"
      >
        {localize(page.title_multiloc)}
      </Title>
      <Box mb="48px">
        <QuillEditedContent
          fontWeight={400}
          textColor={theme.colors.tenantText}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: localize(page.description_multiloc),
            }}
          />
        </QuillEditedContent>
      </Box>
    </>
  );
};

export default PageTitle;
