import React, { PureComponent } from 'react';
import SideModal from 'components/UI/SideModal';
import IdeaEdit from './Idea/IdeaEdit';
import IdeaContent from './Idea/IdeaContent';
import InitiativeContent from './Initiative/InitiativeContent';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
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
  height: 100%;
  width: 100%;
  position: relative;
`;

export const Top = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  height: 50px;
  width: 100%;
  background-color: ${colors.adminBackground};
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
        {mode === 'view' && type === 'Initiatives' && postId &&
          <InitiativeContent
            initiativeId={postId}
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
      </SideModal>
    );
  }
}
