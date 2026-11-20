import React, { forwardRef } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import Breadcrumbs from 'components/UI/Breadcrumbs';

import Link from 'utils/cl-router/Link';

import { QuickSearchEntry } from './filterEntries';

type Props = {
  id: string;
  entry: QuickSearchEntry;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
};

const QuickSearchResult = forwardRef<HTMLAnchorElement, Props>(
  ({ id, entry, active, onSelect, onHover }, ref) => (
    <Link
      id={id}
      ref={ref}
      to={entry.link.to}
      params={entry.link.params}
      onClick={onSelect}
      onMouseEnter={onHover}
      role="option"
      aria-selected={active}
      tabIndex={-1}
    >
      <Box
        px="12px"
        py="8px"
        borderRadius={stylingConsts.borderRadius}
        background={active ? colors.grey100 : undefined}
      >
        <Breadcrumbs
          breadcrumbs={entry.breadcrumbs.map((label) => ({ label }))}
          separator="chevron"
          fontSize="s"
          highlightCurrentPage
        />
      </Box>
    </Link>
  )
);

QuickSearchResult.displayName = 'QuickSearchResult';

export default QuickSearchResult;
