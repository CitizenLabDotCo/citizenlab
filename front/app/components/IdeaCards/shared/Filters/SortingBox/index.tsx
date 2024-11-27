import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import InputFilterCollapsible from 'components/FilterBoxes/InputFilterCollapsible';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SortTypeButton from './SortTypeButton';

type SortingBoxProps = {
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
};
const SortingBox = ({ handleSortOnChange, phaseId }: SortingBoxProps) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const phaseDefaultSort = phase?.data.attributes.ideas_order;

  const [searchParams] = useSearchParams();
  const currentSortType =
    searchParams.get('sort') || phaseDefaultSort || 'trending';

  return (
    <InputFilterCollapsible title={formatMessage(messages.sortBy)}>
      <Box display="flex" flexDirection="column" gap="4px">
        <SortTypeButton
          sortType="popular"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'popular'}
        />
        <SortTypeButton
          sortType="comments_count"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'comments_count'}
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
