import React, { Suspense, useEffect, useState } from 'react';

// components
import SideModal from 'components/UI/SideModal';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import LazyInitiativeEdit from './Initiative/LazyInitiativeEdit';
import LazyInitiativeContent from './Initiative/LazyInitiativeContent';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

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

export interface Props {
  onClose: () => void;
  initiativeId: string | null;
  onSwitchPreviewMode: () => void;
  mode: 'edit' | 'view';
}

const InitiativePostPreview = ({
  onClose,
  initiativeId,
  onSwitchPreviewMode,
  mode,
}: Props) => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof initiativeId === 'string') {
      setOpened(true);
    }
  }, [initiativeId]);

  if (!initiativeId) {
    return null;
  }

  const handleOnClose = () => {
    setOpened(false);
    onClose();
  };

  const previewComponent = () => {
    return {
      view: (
        <LazyInitiativeContent
          initiativeId={initiativeId}
          closePreview={handleOnClose}
          handleClickEdit={onSwitchPreviewMode}
        />
      ),
      edit: (
        <LazyInitiativeEdit
          initiativeId={initiativeId}
          goBack={onSwitchPreviewMode}
        />
      ),
    }[mode];
  };

  return (
    <SideModal opened={opened} close={handleOnClose}>
      <Suspense fallback={<FullPageSpinner />}>{previewComponent()}</Suspense>
    </SideModal>
  );
};

export default InitiativePostPreview;
