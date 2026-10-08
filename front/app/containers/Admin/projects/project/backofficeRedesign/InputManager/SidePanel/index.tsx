import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { ManagerType, PreviewMode } from 'components/admin/PostManager';
import AdminIdeaEdit from 'components/admin/PostManager/components/PostPreview/Idea/AdminIdeaEdit';
import SideModal from 'components/UI/SideModal';

import IdeaOverview from './IdeaOverview';
import PanelHeader, { PanelNavigation } from './PanelHeader';

interface Props {
  ideaId: string | undefined;
  mode: PreviewMode;
  type: ManagerType;
  context: string;
  listedPhase: IPhaseData | undefined;
  navigation: PanelNavigation | undefined;
  onChangeMode: (mode: PreviewMode) => void;
  onClose: () => void;
}

const SidePanel = ({
  ideaId,
  mode,
  type,
  context,
  listedPhase,
  navigation,
  onChangeMode,
  onClose,
}: Props) => {
  const { data: idea, isPlaceholderData } = useIdeaById(ideaId);

  return (
    <SideModal opened={!!ideaId} close={onClose} width="640px">
      {(!idea || isPlaceholderData) && !!ideaId && (
        <Box display="flex" justifyContent="center" py="80px">
          <Spinner />
        </Box>
      )}
      {idea && !isPlaceholderData && (
        <>
          <PanelHeader context={context} navigation={navigation} />
          {mode === 'edit' ? (
            <AdminIdeaEdit
              ideaId={idea.data.id}
              goBack={() => onChangeMode('view')}
            />
          ) : (
            <IdeaOverview
              idea={idea.data}
              type={type}
              listedPhase={listedPhase}
              onEdit={() => onChangeMode('edit')}
              onDeleted={onClose}
            />
          )}
        </>
      )}
    </SideModal>
  );
};

export default SidePanel;
