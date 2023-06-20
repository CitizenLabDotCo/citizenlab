import React, { Suspense, useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyAdminIdeaEdit from './Idea/LazyAdminIdeaEdit';
import LazyIdeaContent from './Idea/LazyIdeaContent';

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
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof ideaId === 'string') {
      setOpened(true);
    }
  }, [ideaId]);

  if (!ideaId) {
    return null;
  }

  const handleOnClose = () => {
    setOpened(false);
    onClose();
  };

  const previewComponent = () => {
    return {
      view: (
        <LazyIdeaContent
          ideaId={ideaId}
          closePreview={handleOnClose}
          handleClickEdit={onSwitchPreviewMode}
        />
      ),
      edit: <LazyAdminIdeaEdit ideaId={ideaId} goBack={onSwitchPreviewMode} />,
    }[mode];
  };

  return (
    <SideModal opened={opened} close={handleOnClose}>
      <Suspense fallback={<FullPageSpinner />}>{previewComponent()}</Suspense>
    </SideModal>
  );
};

export default IdeaPostPreview;
