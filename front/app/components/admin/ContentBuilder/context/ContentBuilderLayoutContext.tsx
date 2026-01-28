import React, { createContext, useContext } from 'react';

interface ContentBuilderLayoutContextData {
  layoutId?: string;
}

const ContentBuilderLayoutContext =
  createContext<ContentBuilderLayoutContextData>({
    layoutId: undefined,
  });

export const useContentBuilderLayoutContext = () => {
  return useContext(ContentBuilderLayoutContext);
};

interface ContentBuilderLayoutProviderProps {
  layoutId?: string;
  children: React.ReactNode;
}

export const ContentBuilderLayoutProvider = ({
  layoutId,
  children,
}: ContentBuilderLayoutProviderProps) => {
  return (
    <ContentBuilderLayoutContext.Provider value={{ layoutId }}>
      {children}
    </ContentBuilderLayoutContext.Provider>
  );
};
