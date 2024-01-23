import React from 'react';

// components
import ViewButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/ViewButton';
import { Icon, colors } from '@citizenlab/cl2-component-library';

interface Props {
  active: boolean;
  onClick: () => void;
}

const PDFButton = ({ active, onClick }: Props) => {
  return (
    <ViewButton
      id="e2e-pdf-preview"
      active={active}
      borderRadius="0px"
      onClick={onClick}
    >
      <Icon
        name="file"
        width="20px"
        fill={active ? colors.white : colors.primary}
      />
    </ViewButton>
  );
};

export default PDFButton;
