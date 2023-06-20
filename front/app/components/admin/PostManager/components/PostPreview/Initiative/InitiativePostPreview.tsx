import React from 'react';

// components
import AdminInitiativeEdit from 'components/admin/PostManager/components/PostPreview/Initiative/AdminInitiativeEdit';
import AdminInitiativeContent from 'components/admin/PostManager/components/PostPreview/Initiative/AdminInitiativeContent';

interface Props {
  onClose: () => void;
  initiativeId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
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
