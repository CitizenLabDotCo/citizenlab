import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PostPreview from './LazyPostPreview/PostPreview';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import { Box } from '@citizenlab/cl2-component-library';

type PreviewMode = 'view' | 'edit';

const PostPreviewIndex = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { ideaId } = useParams() as {
    ideaId: string;
  };

  const handleOnClose = () => {
    clHistory.push('/admin/ideas');
  };

  const handleOnSwitchPreviewMode = () => {
    setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');
  };

  return (
    <>
      <Box mb="24px">
        <GoBackButton onClick={handleOnClose} />
      </Box>
      <PostPreview
        type={'AllIdeas'}
        postId={ideaId}
        mode={previewMode}
        onClose={handleOnClose}
        onSwitchPreviewMode={handleOnSwitchPreviewMode}
      />
    </>
  );
};

export default PostPreviewIndex;
