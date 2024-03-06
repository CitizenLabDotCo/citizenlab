import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import DesktopButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/DesktopButton';
import MobileButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/MobileButton';

import PDFButton from './PDFButton';
import { View } from './typings';

interface Props {
  view: View;
  setView: (view: View) => void;
}

const ViewPicker = ({ view, setView }: Props) => {
  return (
    <Box display="flex" mb="16px" mt="-16px">
      <MobileButton
        active={view === 'phone'}
        onClick={() => {
          setView('phone');
        }}
      />
      <PDFButton
        active={view === 'pdf'}
        onClick={() => {
          setView('pdf');
        }}
      />
      <DesktopButton
        active={view === 'desktop'}
        onClick={() => {
          setView('desktop');
        }}
      />
    </Box>
  );
};

export default ViewPicker;
