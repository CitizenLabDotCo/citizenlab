import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../app/utils/cl-react-query/queryClient';
import { IntlProvider } from 'react-intl';
import messages from '../../app/i18n/en';
import { OutletsContext } from '../../app/containers/OutletsProvider'
import ThemeContext from './ThemeContext';

const EMPTY_OBJ = {};

export default (Story) => (
  <QueryClientProvider client={queryClient}>
    <OutletsContext.Provider value={EMPTY_OBJ}>
      <IntlProvider
        locale="en"
        messages={messages}
        onError={(err) => {
          if (err.code === 'MISSING_TRANSLATION') {
            console.warn('Missing translation', err.message);
            return;
          }
          throw err;
        }}
      >
        <ThemeContext>
          <Story />
        </ThemeContext>
      </IntlProvider>
    </OutletsContext.Provider>
  </QueryClientProvider>
)