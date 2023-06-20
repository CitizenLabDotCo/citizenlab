import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PostPreview from './LazyPostPreview/PostPreview';
import clHistory from 'utils/cl-router/history';

type PreviewMode = 'view' | 'edit';

const PostPreviewIndex = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('view');
  const { ideaId } = useParams() as {
    ideaId: string;
  };

  const handleOnClose = () => {
    clHistory.goBack();
  };

  const handleOnSwitchPreviewMode = () => {
    setPreviewMode(previewMode === 'edit' ? 'view' : 'edit');
  };

  return (
    <PostPreview
      type={'AllIdeas'}
      postId={ideaId}
      mode={previewMode}
      onClose={handleOnClose}
      onSwitchPreviewMode={handleOnSwitchPreviewMode}
    />
  );
};

export default PostPreviewIndex;
