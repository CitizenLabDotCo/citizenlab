import React from 'react';

import { Box, Text, TextProps } from '@citizenlab/cl2-component-library';

import ChangedValue from './ChangedValue';
import SavedValue from './SavedValue';

type Props = {
  changed: boolean;
  // The saved text that a proposed update replaces.
  previous?: string;
  fontSize?: TextProps['fontSize'];
  color?: TextProps['color'];
  children: string;
};

// Long texts, like descriptions, show the saved version above the new one.
const ChangedText = ({
  changed,
  previous,
  fontSize = 's',
  color,
  children,
}: Props) => {
  const replaced = changed && !!previous && previous !== children;

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      {replaced && (
        <Text m="0px" fontSize={fontSize} whiteSpace="pre-line">
          <SavedValue>{previous}</SavedValue>
        </Text>
      )}
      {children && (
        <Text m="0px" fontSize={fontSize} color={color} whiteSpace="pre-line">
          <ChangedValue changed={changed && previous !== children}>
            {children}
          </ChangedValue>
        </Text>
      )}
    </Box>
  );
};

export default ChangedText;
