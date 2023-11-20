import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import { Box } from '@citizenlab/cl2-component-library';
import IdeaPostPreview from './PostPreview/Idea/IdeaPostPreview';
import { PreviewMode } from '..';
import messages from './messages';

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
    setPreviewMode((prevPreviewMode) =>
      prevPreviewMode === 'edit' ? 'view' : 'edit'
    );
  };

  return (
    <Box p="40px">
      <Box mb="24px">
        <GoBackButton
          onClick={handleOnClose}
          customMessage={messages.goToInputManager}
        />
      </Box>

      <IdeaPostPreview
        ideaId={ideaId}
        mode={previewMode}
        onClose={handleOnClose}
        onSwitchPreviewMode={handleOnSwitchPreviewMode}
      />
    </Box>
  );
};

export default IdeaPreviewIndex;
