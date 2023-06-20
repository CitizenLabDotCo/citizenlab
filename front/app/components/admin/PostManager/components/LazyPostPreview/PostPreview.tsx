import React, { Suspense, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyAdminIdeaEdit from './Idea/LazyAdminIdeaEdit';
import LazyIdeaContent from './Idea/LazyIdeaContent';
import LazyInitiativeEdit from './Initiative/LazyInitiativeEdit';
import LazyInitiativeContent from './Initiative/LazyInitiativeContent';

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

interface Props {
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
  const [opened, setOpened] = useState(true);

  const handleOnClose = () => {
    setOpened(false);
    onClose();
  };

  const previewComponent = () => {
    const postType =
      type === 'AllIdeas' || type === 'ProjectIdeas' ? 'idea' : 'initiative';

    if (postId) {
      return {
        view: {
          idea: (
            <LazyIdeaContent
              ideaId={postId}
              closePreview={handleOnClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          ),
          initiative: (
            <LazyInitiativeContent
              initiativeId={postId}
              closePreview={handleOnClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          ),
        },
        edit: {
          idea: (
            <LazyAdminIdeaEdit ideaId={postId} goBack={onSwitchPreviewMode} />
          ),
          initiative: (
            <LazyInitiativeEdit
              initiativeId={postId}
              goBack={onSwitchPreviewMode}
            />
          ),
        },
      }[mode][postType];
    }

    return null;
  };

  return (
    <SideModal opened={opened} close={handleOnClose}>
      <Suspense fallback={<FullPageSpinner />}>{previewComponent()}</Suspense>
    </SideModal>
  );
};

export default PostPreview;
