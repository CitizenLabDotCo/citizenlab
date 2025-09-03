import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../app/utils/cl-react-query/queryClient';
import { OutletsContext } from '../../app/containers/OutletsProvider';
import ThemeContext from './ThemeContext';

const EMPTY_OBJ = {};

const Portals = () => (
  <>
    <div
      id="modal-portal"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
    />
    <div id="mobile-nav-portal" />
  </>
);

// Reset cache when changing to a new story.
// Otherwise mock server overrides don't work
const ResetCacheContext = ({ children }) => {
  useEffect(() => {
    queryClient.invalidateQueries();
  }, [window.location.search]);
  return <>{children}</>;
};

export default (Story) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OutletsContext.Provider value={EMPTY_OBJ}>
        <ResetCacheContext>
          <ThemeContext>
            <Portals />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Story />
            </div>
          </ThemeContext>
        </ResetCacheContext>
      </OutletsContext.Provider>
    </QueryClientProvider>
  );
};
