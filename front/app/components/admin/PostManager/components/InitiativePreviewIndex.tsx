import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import GoBackButton from 'components/UI/GoBackButton';

import clHistory from 'utils/cl-router/history';

import { PreviewMode } from '..';

import messages from './messages';
import InitiativePostPreview from './PostPreview/Initiative/InitiativePostPreview';

const InitiativePreviewIndex = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { initiativeId } = useParams() as {
    initiativeId: string;
  };

  const handleOnClose = () => {
    clHistory.push('/admin/initiatives');
  };

  const handleOnSwitchPreviewMode = () => {
    setPreviewMode((previewMode) => (previewMode === 'edit' ? 'view' : 'edit'));
  };

  return (
    <>
      <Box mb="24px">
        <GoBackButton
          onClick={handleOnClose}
          customMessage={messages.goToProposalManager}
        />
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
