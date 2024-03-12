import React from 'react';

import { Box, colors, Button } from '@citizenlab/cl2-component-library';

import { View } from './typings';

interface Props {
  view: View;
  setView: (view: View) => void;
}

const ViewPicker = ({ view, setView }: Props) => {
  return (
    <Box display="flex" p="4px" bgColor={colors.background} borderRadius="3px">
      <Button
        icon="tablet"
        buttonStyle="text"
        bgColor={view === 'phone' ? colors.white : colors.background}
        bgHoverColor={colors.white}
        iconColor={colors.textPrimary}
        iconSize="16px"
        onClick={() => setView('phone')}
        p="4px 8px"
        mx="2px"
      />
      <Button
        icon="file"
        buttonStyle="text"
        bgColor={view === 'pdf' ? colors.white : colors.background}
        bgHoverColor={colors.white}
        iconColor={colors.textPrimary}
        iconSize="16px"
        onClick={() => setView('pdf')}
        p="4px 8px"
        mx="2px"
      />
      <Button
        icon="desktop"
        buttonStyle="text"
        bgColor={view === 'desktop' ? colors.white : colors.background}
        bgHoverColor={colors.white}
        iconColor={colors.textPrimary}
        iconSize="16px"
        onClick={() => setView('desktop')}
        p="4px 8px"
        mx="2px"
      />
    </Box>
  );
};

export default ViewPicker;
