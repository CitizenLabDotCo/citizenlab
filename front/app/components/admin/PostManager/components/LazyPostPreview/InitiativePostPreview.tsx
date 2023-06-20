import React, { Suspense, useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyInitiativeEdit from './Initiative/LazyInitiativeEdit';
import LazyInitiativeContent from './Initiative/LazyInitiativeContent';

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
        <LazyInitiativeContent
          initiativeId={initiativeId}
          closePreview={handleOnClose}
          handleClickEdit={onSwitchPreviewMode}
        />
      ),
      edit: (
        <LazyInitiativeEdit
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
