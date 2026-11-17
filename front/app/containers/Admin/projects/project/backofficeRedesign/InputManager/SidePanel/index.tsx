import React, { KeyboardEvent } from 'react';

import DesignSystemSidePanel from 'design-system/SidePanel';
import Spinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { ManagerType } from 'components/admin/PostManager';

import IdeaOverview from './IdeaOverview';
import PanelHeader, { PanelNavigation } from './PanelHeader';
import styles from './SidePanel.module.css';

const isEditable = (target: EventTarget): target is HTMLElement =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Escape first leaves the field being typed in, so its text isn't lost; a
// second Escape closes the panel. Runs while bubbling, so widgets that handle
// Escape themselves (open menus, search fields) still go first.
const blurFieldOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
  const { target, currentTarget } = event;
  if (
    event.key !== 'Escape' ||
    event.isDefaultPrevented() ||
    // Modals and popovers opened from the panel are portalled elsewhere.
    !(target instanceof Node) ||
    !currentTarget.contains(target) ||
    !isEditable(target)
  ) {
    return;
  }

  target.blur();
  event.stopPropagation();
};

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
  const isLoaded = !!idea && !isPlaceholderData;

  return (
    <DesignSystemSidePanel
      isOpen={!!ideaId}
      onOpenChange={(isOpen) => {
        // The edit modal sits on top of the panel; closing it keeps the panel.
        if (!isOpen && !isEditing) onClose();
      }}
      title={context}
    >
      <div
        id="e2e-side-modal-content"
        className={styles.content}
        role="presentation"
        onKeyDown={blurFieldOnEscape}
      >
        {!isLoaded && !!ideaId && (
          <div className={styles.loading}>
            <Spinner />
          </div>
        )}
        {idea && isLoaded && (
          <>
            {navigation && <PanelHeader navigation={navigation} />}
            <IdeaOverview
              idea={idea.data}
              type={type}
              listedPhase={listedPhase}
              onEdit={() => onEdit(idea.data.id)}
              onDeleted={onDeleted}
            />
          </>
        )}
      </div>
    </DesignSystemSidePanel>
  );
};

export default SidePanel;
