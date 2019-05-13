import React, { PureComponent } from 'react';

import SideModal from 'components/UI/SideModal';
import IdeaEdit from './IdeaEdit';
import IdeaContent from './IdeaContent';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface DataProps {}

interface InputProps {
  onCloseModal: () => void;
  ideaId: string | null;
  onSwitchIdeaMode: () => void;
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

export default class IdeaPreview extends PureComponent<Props> {

  render() {
    const { ideaId, onCloseModal, onSwitchIdeaMode, mode } = this.props;

    return (
      <SideModal
        opened={!!ideaId}
        close={onCloseModal}
      >
        {mode === 'view' &&
          <IdeaContent
            ideaId={ideaId}
            closeSideModal={onCloseModal}
            handleClickEdit={onSwitchIdeaMode}
          />
        }
        {mode === 'edit' && ideaId &&
          <IdeaEdit
            ideaId={ideaId}
            goBack={onSwitchIdeaMode}
          />
        }
      </SideModal>
    );
  }
}
