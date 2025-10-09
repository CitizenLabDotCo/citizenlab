import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { graphqlQueryClient } from './graphqlQueryClient';

type Props = {
  children: React.ReactNode;
};

export const GraphQLQueryProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={graphqlQueryClient}>
      {children}
    </QueryClientProvider>
  );
};
