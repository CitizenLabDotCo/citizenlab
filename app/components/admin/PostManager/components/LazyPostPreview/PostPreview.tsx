import React, { Suspense, PureComponent } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyIdeaEdit from './Idea/LazyIdeaEdit';
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
  border-bottom: 1px solid ${colors.separation};
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

interface DataProps {}

interface InputProps {
  type: ManagerType;
  onClose: () => void;
  postId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
}

interface Props extends InputProps, DataProps {}

interface State {
  postId: string | null;
  opened: boolean;
}

export default class PostPreview extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      postId: props.postId,
      opened: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.postId !== this.props.postId && this.props.postId) {
      this.setState({ opened: true });
      setTimeout(() => this.setState({ postId: this.props.postId }), 200);
    }
  }

  onClose = () => {
    this.setState({ opened: false });
    setTimeout(() => {
      this.setState({ postId: null });
      this.props.onClose();
    }, 450);
  };

  previewComponent = () => {
    const { type, onSwitchPreviewMode, mode } = this.props;
    const postType =
      type === 'AllIdeas' || type === 'ProjectIdeas' ? 'idea' : 'initiative';
    const { postId } = this.state;

    if (postId) {
      return {
        view: {
          idea: (
            <LazyIdeaContent
              ideaId={postId}
              closePreview={this.onClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          ),
          initiative: (
            <LazyInitiativeContent
              initiativeId={postId}
              closePreview={this.onClose}
              handleClickEdit={onSwitchPreviewMode}
            />
          ),
        },
        edit: {
          idea: <LazyIdeaEdit ideaId={postId} goBack={onSwitchPreviewMode} />,
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

  render() {
    const { opened } = this.state;

    return (
      <SideModal opened={opened} close={this.onClose}>
        <Suspense fallback={<FullPageSpinner />}>
          {this.previewComponent()}
        </Suspense>
      </SideModal>
    );
  }
}
