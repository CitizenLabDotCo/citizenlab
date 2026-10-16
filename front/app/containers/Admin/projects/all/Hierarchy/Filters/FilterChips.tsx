import React from 'react';

import { Box, Button, bo, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import filterBarMessages from '../../_shared/FilterBar/messages';
import { Level } from '../level';

import FilterChip from './FilterChip';
import useFilters from './useFilters';

interface Props {
  level: Level;
}

// The filters in use, one chip each, and a button to clear them all.
const FilterChips = ({ level }: Props) => {
  const { formatMessage } = useIntl();
  const { activeFacets, clearFilters } = useFilters(level);

  if (activeFacets.length === 0) return null;

  return (
    <Box
      data-cy="projects-hierarchy-filter-chips"
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap="6px"
      minHeight="40px"
      px="8px"
      py="6px"
      mb="16px"
      bgColor={colors.grey50}
      borderRadius={bo.borderRadius}
    >
      {activeFacets.map((key) => (
        <FilterChip key={key} facetKey={key} level={level} />
      ))}
      <Box flex="1" />
      <Button
        type="button"
        buttonStyle="bo-text"
        textColor={colors.textPrimary}
        padding="4px 10px"
        onClick={clearFilters}
      >
        {formatMessage(filterBarMessages.clear)}
      </Button>
    </Box>
  );
};

export default FilterChips;
