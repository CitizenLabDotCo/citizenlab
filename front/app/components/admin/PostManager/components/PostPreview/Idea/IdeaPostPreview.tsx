import React from 'react';

// components
import AdminIdeaEdit from 'components/admin/PostManager/components/PostPreview/Idea/AdminIdeaEdit';
import AdminIdeaContent from 'components/admin/PostManager/components/PostPreview/Idea/AdminIdeaContent';

export interface Props {
  onClose: () => void;
  ideaId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
}

const IdeaPostPreview = ({
  onClose,
  ideaId,
  onSwitchPreviewMode,
  mode,
}: Props) => {
  if (!ideaId) {
    return null;
  }

  return {
    view: (
      <AdminIdeaContent
        ideaId={ideaId}
        closePreview={onClose}
        handleClickEdit={onSwitchPreviewMode}
      />
    ),
    edit: <AdminIdeaEdit ideaId={ideaId} goBack={onSwitchPreviewMode} />,
  }[mode];
};

export default IdeaPostPreview;
