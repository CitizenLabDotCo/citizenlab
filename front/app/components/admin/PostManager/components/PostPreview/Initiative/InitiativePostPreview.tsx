import React from 'react';

import { PreviewMode } from 'components/admin/PostManager';
import AdminInitiativeContent from 'components/admin/PostManager/components/PostPreview/Initiative/AdminInitiativeContent';
import AdminInitiativeEdit from 'components/admin/PostManager/components/PostPreview/Initiative/AdminInitiativeEdit';

interface Props {
  onClose: () => void;
  initiativeId: string | null;
  onSwitchPreviewMode: () => void;
  mode: PreviewMode;
}

const InitiativePostPreview = ({
  onClose,
  initiativeId,
  onSwitchPreviewMode,
  mode,
}: Props) => {
  if (!initiativeId) {
    return null;
  }

  return {
    view: (
      <AdminInitiativeContent
        initiativeId={initiativeId}
        closePreview={onClose}
        handleClickEdit={onSwitchPreviewMode}
      />
    ),
    edit: (
      <AdminInitiativeEdit
        initiativeId={initiativeId}
        goBack={onSwitchPreviewMode}
      />
    ),
  }[mode];
};

export default InitiativePostPreview;
