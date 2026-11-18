import React, { ReactNode, createContext, useContext, useState } from 'react';

import usePhases from 'api/phases/usePhases';

interface ParticipationPanel {
  pending: boolean;
  collapsed: boolean;
  // Only a toggle by the admin animates; the default state just appears.
  animate: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ParticipationPanelContext = createContext<ParticipationPanel | null>(
  null
);

interface Props {
  projectId: string;
  children: ReactNode;
}

export const ParticipationPanelProvider = ({ projectId, children }: Props) => {
  const { data: phases, isPlaceholderData } = usePhases(projectId, 'all');
  const [choice, setChoice] = useState<{
    projectId: string;
    collapsed: boolean;
  }>();
  const chosen = choice?.projectId === projectId ? choice : undefined;

  // Placeholder data still belongs to the previous project.
  const pending = !chosen && (isPlaceholderData || !phases);
  const collapsed = chosen?.collapsed ?? false;

  return (
    <ParticipationPanelContext.Provider
      value={{
        pending,
        collapsed,
        animate: !!chosen,
        setCollapsed: (collapsed) => setChoice({ projectId, collapsed }),
      }}
    >
      {children}
    </ParticipationPanelContext.Provider>
  );
};

export const useParticipationPanel = () => {
  const panel = useContext(ParticipationPanelContext);
  if (!panel) {
    throw new Error(
      'useParticipationPanel must be used inside ParticipationPanelProvider'
    );
  }
  return panel;
};
