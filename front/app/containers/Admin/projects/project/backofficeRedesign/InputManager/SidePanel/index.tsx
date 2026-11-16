import React from 'react';

import DesignSystemSidePanel from 'design-system/SidePanel';
import Spinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { ManagerType, PreviewMode } from 'components/admin/PostManager';
import AdminIdeaEdit from 'components/admin/PostManager/components/PostPreview/Idea/AdminIdeaEdit';

import IdeaOverview from './IdeaOverview';
import PanelHeader, { PanelNavigation } from './PanelHeader';
import styles from './SidePanel.module.css';

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
  const isLoaded = !!idea && !isPlaceholderData;

  return (
    <DesignSystemSidePanel
      isOpen={!!ideaId}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={context}
    >
      <div id="e2e-side-modal-content" className={styles.content}>
        {!isLoaded && !!ideaId && (
          <div className={styles.loading}>
            <Spinner />
          </div>
        )}
        {idea && isLoaded && (
          <>
            {navigation && <PanelHeader navigation={navigation} />}
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
      </div>
    </DesignSystemSidePanel>
  );
};

export default SidePanel;
