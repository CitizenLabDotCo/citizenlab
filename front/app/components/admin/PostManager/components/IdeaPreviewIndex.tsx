import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import { Box } from '@citizenlab/cl2-component-library';
import IdeaPostPreview from './PostPreview/Idea/IdeaPostPreview';
import { PreviewMode } from '..';

interface Props {
  goBackUrl: string;
}

const IdeaPreviewIndex = ({ goBackUrl }: Props) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { ideaId } = useParams() as {
    ideaId: string;
  };

  const handleOnClose = () => {
    clHistory.push(goBackUrl);
  };

  const handleOnSwitchPreviewMode = () => {
    setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');
  };

  return (
    <>
      <Box mb="24px">
        <GoBackButton onClick={handleOnClose} />
      </Box>

      <IdeaPostPreview
        ideaId={ideaId}
        mode={previewMode}
        onClose={handleOnClose}
        onSwitchPreviewMode={handleOnSwitchPreviewMode}
      />
    </>
  );
};

export default IdeaPreviewIndex;
