import React, { lazy, Suspense, PureComponent } from 'react';
import SideModal from 'components/UI/SideModal';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ManagerType } from '../..';

// components
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyIdeaEdit from './Idea/LazyIdeaEdit';
import LazyIdeaContent from './Idea/LazyIdeaContent';

// lazy-loaded components
const InitiativeContent = lazy(() => import('./Initiative/InitiativeContent'));
const InitiativeEdit = lazy(() => import('./Initiative/InitiativeEdit'));

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
  background-color: white;
  border-bottom: 1px solid ${colors.separation};
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 50px;
  width: 100%;
  padding-left: 10px;
  padding-right: 50px;
  z-index: 1;
`;

export const Content = styled.div`
  padding: 30px;
  margin-top: 50px;
  width: 100%;
`;

export default class PostPreview extends PureComponent<Props> {
  previewComponent = () => {
    const { type, postId, onClose, onSwitchPreviewMode, mode } = this.props;
    const postType = (type === 'AllIdeas' || type === 'ProjectIdeas') ? 'idea' : 'initiative';

    if (postId) {
      return ({
        view: {
          idea: (
            <LazyIdeaContent
              ideaId={postId}
              closePreview={onClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          ),
          initiative: (
            <InitiativeContent
              initiativeId={postId}
              closePreview={onClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          )
        },
        edit: {
          idea: (
            <LazyIdeaEdit
              ideaId={postId}
              goBack={onSwitchPreviewMode}
            />
          ),
          initiative: (
            <InitiativeEdit
              initiativeId={postId}
              goBack={onSwitchPreviewMode}
            />
          )
        }
      }[mode][postType]);
    }

    return null;
  }

  render() {
    const { postId, onClose } = this.props;

    return (
      <SideModal
        opened={!!postId}
        close={onClose}
      >
        <Suspense fallback={<FullPageSpinner />}>
          {this.previewComponent()}
        </Suspense>
      </SideModal>
    );
  }
}
