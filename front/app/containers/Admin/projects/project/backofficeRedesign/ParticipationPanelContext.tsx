import React, { ReactNode, createContext, useContext, useState } from 'react';

import usePhases from 'api/phases/usePhases';

interface ParticipationPanel {
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
  const { data: phases } = usePhases(projectId);
  const [choice, setChoice] = useState<{
    projectId: string;
    collapsed: boolean;
  }>();
  const chosen = choice?.projectId === projectId ? choice : undefined;

  // Until the admin toggles it, the panel stays closed while the project has
  // no methods, and opens on its own once the first one is added.
  const collapsed = chosen ? chosen.collapsed : phases?.data.length === 0;

  return (
    <ParticipationPanelContext.Provider
      value={{
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
