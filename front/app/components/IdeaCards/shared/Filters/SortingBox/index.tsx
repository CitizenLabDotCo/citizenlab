import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

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
  const phaseDefaultSort = phase?.data.attributes.ideas_order;

  const [searchParams] = useSearchParams();
  const currentSortType =
    searchParams.get('sort') || phaseDefaultSort || 'trending';
  const marginBottom = '4px';

  return (
    <InputFilterCollapsible title={formatMessage(messages.sortBy)}>
      <Box
        bgColor={colors.white}
        display="flex"
        flexDirection="column"
        p="12px"
        pt="0"
      >
        <SortTypeButton
          sortType="popular"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'popular'}
          mb={marginBottom}
        />
        <SortTypeButton
          sortType="trending"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'trending'}
          mb={marginBottom}
        />
        <SortTypeButton
          sortType="random"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'random'}
          mb={marginBottom}
        />
        <SortTypeButton
          sortType="new"
          handleSortOnChange={handleSortOnChange}
          isSelected={currentSortType === 'new'}
          mb={marginBottom}
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
