import React, { useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import IdeaPostPreview from './Idea/IdeaPostPreview';
import InitiativePostPreview from './Initiative/InitiativePostPreview';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { ManagerType } from '../..';

export const Container = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
`;

export const Top = styled.div`
  background-color: white;
  border-bottom: 1px solid ${colors.divider};
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  left: 0;
  height: 50px;
  width: 100%;
  padding-left: 15px;
  padding-right: 50px;
  z-index: 1001;
`;

export const Content = styled.div`
  padding: 30px;
  padding-left: 35px;
  padding-right: 35px;
  margin-top: 0px;
  width: 100%;

  &.idea-form {
    background: #f4f4f4;
  }
`;

export interface Props {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
}

const PostPreview = ({
  type,
  onClose,
  postId,
  onSwitchPreviewMode,
  mode,
}: Props) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof postId === 'string') {
      setOpened(true);
    }
  }, [postId]);

  const handleOnClose = () => {
    setOpened(false);
    onClose();
  };

  const previewComponent = () => {
    const postType =
      type === 'AllIdeas' || type === 'ProjectIdeas' ? 'idea' : 'initiative';

    if (postId) {
      return {
        idea: (
          <IdeaPostPreview
            onClose={onClose}
            ideaId={postId}
            onSwitchPreviewMode={onSwitchPreviewMode}
            mode={mode}
          />
        ),
        initiative: (
          <InitiativePostPreview
            onClose={onClose}
            initiativeId={postId}
            onSwitchPreviewMode={onSwitchPreviewMode}
            mode={mode}
          />
        ),
      }[postType];
    }

    return null;
  };

  return (
    <SideModal opened={opened} close={handleOnClose}>
      {previewComponent()}
    </SideModal>
  );
};

export default PostPreview;
