import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import EmojiPickerInput from 'components/UI/EmojiPicker';

interface Props {
  value?: string | null;
  onChange: (emoji: string | null) => void;
}

const PageEmojiPicker = ({ value, onChange }: Props) => (
  <Box mb="16px">
    <EmojiPickerInput value={value} onChange={onChange} placement="top" />
  </Box>
);

export default PageEmojiPicker;
