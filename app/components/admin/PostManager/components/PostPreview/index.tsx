import React, { PureComponent } from 'react';
import SideModal from 'components/UI/SideModal';
import IdeaEdit from './IdeaEdit';
import InitiativeEdit from './InitiativeEdit';
import IdeaContent from './IdeaContent';
import styled from 'styled-components';
import { ManagerType } from '../..';

interface DataProps {}

interface InputProps {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
}

interface Props extends InputProps, DataProps {}

export const Container = styled.div`
  min-height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Top = styled.div`
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  height: 50px;
  width: 100%;
  padding-left: 10px;
  padding-right: 50px;
  z-index: 1;
`;

export const Content = styled.div`
  padding: 30px;
  margin-top: 50px;
`;

export default class PostPreview extends PureComponent<Props> {

  render() {
    const { type, postId, onClose, onSwitchPreviewMode, mode } = this.props;

    return (
      <SideModal
        opened={!!postId}
        close={onClose}
      >
        {mode === 'view' && (type === 'AllIdeas' || type === 'ProjectIdeas') && postId &&
          <IdeaContent
            ideaId={postId}
            closePreview={onClose}
            handleClickEdit={onSwitchPreviewMode}
          />
        }
        {mode === 'edit' && postId && (type === 'AllIdeas' || type === 'ProjectIdeas') && postId &&
          <IdeaEdit
            ideaId={postId}
            goBack={onSwitchPreviewMode}
          />
        }
        {mode === 'edit' && postId && (type === 'Initiatives') &&
          <InitiativeEdit
            initiativeId={postId}
            goBack={onSwitchPreviewMode}
          />
        }
      </SideModal>
    );
  }
}
