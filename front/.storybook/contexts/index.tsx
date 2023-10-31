import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../app/utils/cl-react-query/queryClient';
import { OutletsContext } from '../../app/containers/OutletsProvider';
import ThemeContext from './ThemeContext';

const EMPTY_OBJ = {};

const Portals = () => (
  <>
    <div id="modal-portal" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} />
    <div id="topbar-portal" />
    <div id="mobile-nav-portal" />
  </>
);

export default (Story) => {
  return (
    <QueryClientProvider client={queryClient}>
      <OutletsContext.Provider value={EMPTY_OBJ}>
        <ThemeContext>
          <Portals />
          <Story />
        </ThemeContext>
      </OutletsContext.Provider>
    </QueryClientProvider>
  );
};
