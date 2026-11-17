import React from 'react';

import { Box, CollapsibleContainer } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

interface MultilocFieldCollapsibleProps {
  title: string;
  name: string;
  label: string;
  mb?: string;
}

const MultilocFieldCollapsible = ({
  title,
  name,
  label,
  mb = '24px',
}: MultilocFieldCollapsibleProps) => {
  const theme = useTheme();

  return (
    <CollapsibleContainer
      mb={mb}
      title={title}
      titleVariant="h4"
      titleAs="h2"
      titleFontWeight="bold"
      titlePadding="16px"
      border={`1px solid ${theme.colors.grey300}`}
      borderRadius={theme.borderRadius}
      isOpenByDefault
    >
      <Box p="24px" pt="12px">
        <QuillMultilocWithLocaleSwitcher
          name={name}
          label={label}
          noVideos
          noLinks
        />
      </Box>
    </CollapsibleContainer>
  );
};

export default MultilocFieldCollapsible;
