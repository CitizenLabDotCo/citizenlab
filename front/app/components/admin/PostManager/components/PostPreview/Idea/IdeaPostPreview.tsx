import React, { useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
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
        <AdminIdeaContent
          ideaId={ideaId}
          closePreview={handleOnClose}
          handleClickEdit={onSwitchPreviewMode}
        />
      ),
      edit: <AdminIdeaEdit ideaId={ideaId} goBack={onSwitchPreviewMode} />,
    }[mode];
  };

  return (
    <SideModal opened={opened} close={handleOnClose}>
      {previewComponent()}
    </SideModal>
  );
};

export default IdeaPostPreview;
