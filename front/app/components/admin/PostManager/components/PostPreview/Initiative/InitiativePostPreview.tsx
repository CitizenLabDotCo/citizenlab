import React, { Suspense, useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
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
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof initiativeId === 'string') {
      setOpened(true);
    }
  }, [initiativeId]);

  if (!initiativeId) {
    return null;
  }

  const handleOnClose = () => {
    setOpened(false);
    onClose();
  };

  const previewComponent = () => {
    return {
      view: (
        <AdminInitiativeContent
          initiativeId={initiativeId}
          closePreview={handleOnClose}
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

  return (
    <SideModal opened={opened} close={handleOnClose}>
      <Suspense fallback={<FullPageSpinner />}>{previewComponent()}</Suspense>
    </SideModal>
  );
};

export default InitiativePostPreview;
