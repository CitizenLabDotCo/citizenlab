import React from 'react';

import { PreviewMode } from 'components/admin/PostManager';

import AdminIdeaContent from './AdminIdeaContent';
import AdminIdeaEdit from './AdminIdeaEdit';

export interface Props {
  onClose: () => void;
  ideaId: string | null;
  onSwitchPreviewMode: () => void;
  mode: PreviewMode;
  selectedPhaseId?: string;
}

const IdeaPostPreview = ({
  onClose,
  ideaId,
  onSwitchPreviewMode,
  mode,
  selectedPhaseId,
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
        selectedPhaseId={selectedPhaseId}
      />
    ),
    edit: <AdminIdeaEdit ideaId={ideaId} goBack={onSwitchPreviewMode} />,
  }[mode];
};

export default IdeaPostPreview;
