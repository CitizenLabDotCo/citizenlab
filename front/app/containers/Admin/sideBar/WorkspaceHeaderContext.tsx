import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface WorkspaceHeader {
  element: HTMLElement | null;
  setElement: (element: HTMLElement | null) => void;
}

const WorkspaceHeaderContext = createContext<WorkspaceHeader | null>(null);

interface Props {
  children: ReactNode;
}

export const WorkspaceHeaderProvider = ({ children }: Props) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const value = useMemo(() => ({ element, setElement }), [element]);

  return (
    <WorkspaceHeaderContext.Provider value={value}>
      {children}
    </WorkspaceHeaderContext.Provider>
  );
};

export const useWorkspaceHeader = () => useContext(WorkspaceHeaderContext);
