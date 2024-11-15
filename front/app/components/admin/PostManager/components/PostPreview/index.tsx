import React, { useEffect, useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import SideModal from 'components/UI/SideModal';

import { ManagerType, PreviewMode } from '../..';

import IdeaPostPreview from './Idea/IdeaPostPreview';

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
  width: 100%;
  padding: 16px;
  z-index: 1;
`;

export const Content = styled.div`
  padding: 30px;
  padding-left: 35px;
  padding-right: 35px;
  margin-top: 0px;
  width: 100%;

  &.idea-form {
    background: ${colors.background};
  }
`;

export interface Props {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  onSwitchPreviewMode: () => void;
  mode: PreviewMode;
  selectedPhaseId?: string;
}

const PostPreview = ({
  onClose,
  postId,
  onSwitchPreviewMode,
  mode,
  selectedPhaseId,
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

  return (
    <SideModal opened={opened} close={handleOnClose}>
      <IdeaPostPreview
        onClose={handleOnClose}
        ideaId={postId}
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode={mode}
        selectedPhaseId={selectedPhaseId}
      />
    </SideModal>
  );
};

export default PostPreview;
