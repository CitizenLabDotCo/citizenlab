import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { IdeaDefaultSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import InputFilterCollapsible from 'components/FilterBoxes/InputFilterCollapsible';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SortTypeButton from './SortTypeButton';

type SortingBoxProps = {
  handleSortOnChange: (sort: IdeaDefaultSortMethod) => void;
  phaseId?: string;
};
const SortingBox = ({ handleSortOnChange, phaseId }: SortingBoxProps) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const theme = useTheme();
  const phaseDefaultSort = phase?.data.attributes.ideas_order;

  const [searchParams] = useSearchParams();
  const currentSortType =
    searchParams.get('sort') || phaseDefaultSort || 'trending';

  return (
    <InputFilterCollapsible title={formatMessage(messages.sortBy)}>
      <Box
        bgColor={colors.white}
        display="flex"
        flexDirection="column"
        p="12px"
        pt="0"
        borderRadius={theme.borderRadius}
        gap="4px"
      >
        <SortTypeButton
          sortType="popular"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'popular'}
        />
        <SortTypeButton
          sortType="trending"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'trending'}
        />
        <SortTypeButton
          sortType="random"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'random'}
        />
        <SortTypeButton
          sortType="new"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'new'}
        />
        <SortTypeButton
          sortType="-new"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === '-new'}
        />
      </Box>
    </InputFilterCollapsible>
  );
};

export default SortingBox;
