import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { ManagerType } from 'components/admin/PostManager';
import SideModal from 'components/UI/SideModal';

import IdeaOverview from './IdeaOverview';
import PanelHeader, { PanelNavigation } from './PanelHeader';

interface Props {
  ideaId: string | undefined;
  type: ManagerType;
  context: string;
  listedPhase: IPhaseData | undefined;
  navigation: PanelNavigation | undefined;
  onEdit: (ideaId: string) => void;
  onClose: () => void;
  /** Runs after the input is deleted from the panel. Closes it by default. */
  onDeleted?: () => void;
  /** True while the edit modal is open on top of the panel. */
  isEditing: boolean;
}

const SidePanel = ({
  ideaId,
  type,
  context,
  listedPhase,
  navigation,
  onEdit,
  onClose,
  onDeleted = onClose,
  isEditing,
}: Props) => {
  const { data: idea, isPlaceholderData } = useIdeaById(ideaId);

  return (
    <SideModal
      opened={!!ideaId}
      close={onClose}
      width="640px"
      variant="bo"
      // Clicks in the edit modal land outside the panel and would close it.
      closeOnClickOutside={!isEditing}
    >
      {(!idea || isPlaceholderData) && !!ideaId && (
        <Box display="flex" justifyContent="center" py="80px">
          <Spinner />
        </Box>
      )}
      {idea && !isPlaceholderData && (
        <Box display="flex" flexDirection="column" height="100%">
          <PanelHeader context={context} navigation={navigation} />
          <Box flex="1" minHeight="0" overflowY="auto">
            <IdeaOverview
              idea={idea.data}
              type={type}
              listedPhase={listedPhase}
              onEdit={() => onEdit(idea.data.id)}
              onDeleted={onDeleted}
            />
          </Box>
        </Box>
      )}
    </SideModal>
  );
};

export default SidePanel;
