import React, { PureComponent } from 'react';
import SideModal from 'components/UI/SideModal';
import IdeaEdit from './IdeaEdit';
import IdeaContent from './IdeaContent';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface DataProps {}

interface InputProps {
  closeSideModal: () => void;
  ideaId: string | null;
}

interface Props extends InputProps, DataProps {}

interface State {
  mode: 'view' | 'edit';
}

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

export default class IdeaPreview extends PureComponent<Props, State> {
  constructor (props) {
    super(props);
    this.state = {
      mode: 'view',
    };
  }

  onCloseModal = () => {
    this.onSwitchIdeaMode('view')();
    this.props.closeSideModal();
  }

  onSwitchIdeaMode = (mode: 'view' | 'edit') => () => this.setState({ mode });

  render() {
    const { ideaId } = this.props;
    const { mode } = this.state;

    return (
      <SideModal
        opened={!!ideaId}
        close={this.onCloseModal}
      >
        {mode === 'view' &&
          <IdeaContent
            ideaId={ideaId}
            closeSideModal={this.onCloseModal}
            handleClickEdit={this.onSwitchIdeaMode('edit')}
          />
        }
        {mode === 'edit' && ideaId &&
          <IdeaEdit
            ideaId={ideaId}
            goBack={this.onSwitchIdeaMode('view')}
          />
        }
      </SideModal>
    );
  }
}
