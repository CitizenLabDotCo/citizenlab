import React, { useEffect, useRef } from 'react';
import { Query, QueryClientProvider } from '@tanstack/react-query';
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

// What the query cache holds data for, in this document.
let cachedFor: string | undefined;

// A story with its own mock handlers (parameters.msw) must not show what
// the cache kept from the story before it. So when the story, the city or
// the language changes, the queries cached before it rendered are fetched
// again once it has mounted, when its handlers are in place. Queries the
// story starts itself already use its handlers and are fetched once. Cards
// rendered together in one document (docs view, as the workbench's gallery
// frame does) share the default handlers: a new card refetches nothing.
const ResetCacheContext = ({ cacheKey, children }) => {
  const cached = useRef<{ key?: string; queries: Set<Query> }>({
    queries: new Set(),
  });
  if (cached.current.key !== cacheKey) {
    cached.current = {
      key: cacheKey,
      queries: new Set(queryClient.getQueryCache().getAll()),
    };
  }
  useEffect(() => {
    if (cacheKey === cachedFor) return;
    cachedFor = cacheKey;
    const { queries } = cached.current;
    queryClient.invalidateQueries({ predicate: (query) => queries.has(query) });
  }, [cacheKey]);
  return <>{children}</>;
};

export default (Story, context) => {
  const cacheKey = [
    context.viewMode === 'story' ? context.id : 'docs',
    context.globals.city,
    context.globals.lang,
  ].join(' ');
  return (
    <QueryClientProvider client={queryClient}>
      <OutletsContext.Provider value={EMPTY_OBJ}>
        <ResetCacheContext cacheKey={cacheKey}>
          <ThemeContext city={context.globals.city} lang={context.globals.lang}>
            <Portals />
            {/* The workbench canvas restyles this box by its attribute. */}
            <div
              data-gv-story-box=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                // Safe: a story taller or wider than the frame starts at
                // its top-left edge instead of being cut off above it.
                alignItems: 'safe center',
                justifyContent: 'safe center',
              }}
            >
              <Story />
            </div>
          </ThemeContext>
        </ResetCacheContext>
      </OutletsContext.Provider>
    </QueryClientProvider>
  );
};
