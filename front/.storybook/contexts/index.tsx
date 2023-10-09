import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../app/utils/cl-react-query/queryClient';
import { OutletsContext } from '../../app/containers/OutletsProvider'
import ThemeContext from './ThemeContext';

const EMPTY_OBJ = {};

export default (Story) => (
  <QueryClientProvider client={queryClient}>
    <OutletsContext.Provider value={EMPTY_OBJ}>
      <ThemeContext>
        <Story />
      </ThemeContext>
    </OutletsContext.Provider>
  </QueryClientProvider>
)