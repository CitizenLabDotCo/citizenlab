import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import { Box } from '@citizenlab/cl2-component-library';
import InitiativePostPreview from './PostPreview/Initiative/InitiativePostPreview';
import { PreviewMode } from '..';

const InitiativePreviewIndex = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };

  const handleOnClose = () => {
    clHistory.push('/admin/initiatives');
  };

  const handleOnSwitchPreviewMode = () => {
    setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');
  };

  return (
    <>
      <Box mb="24px">
        <GoBackButton onClick={handleOnClose} />
      </Box>

      <InitiativePostPreview
        initiativeId={initiativeId}
        mode={previewMode}
        onClose={handleOnClose}
        onSwitchPreviewMode={handleOnSwitchPreviewMode}
      />
    </>
  );
};

export default InitiativePreviewIndex;
