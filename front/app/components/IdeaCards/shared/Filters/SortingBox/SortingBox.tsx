import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';
import CollapsibleContainer from 'component-library/components/CollapsibleContainer';
import { useSearchParams } from 'react-router-dom';

import { FrontOfficeSort } from 'api/ideas/types';
import usePhase from 'api/phases/usePhase';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SortTypeButton from './SortTypeButton';

type SortingBoxProps = {
  handleSortOnChange: (sort: FrontOfficeSort) => void;
  phaseId?: string;
};
const SortingBox = ({ handleSortOnChange, phaseId }: SortingBoxProps) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const defaultSort = phase?.data.attributes.ideas_order;

  const [searchParams] = useSearchParams();
  let currentSortType = searchParams.get('sort');

  if (!currentSortType) {
    currentSortType = defaultSort || 'trending';
  }

  return (
    <Box background={colors.white} borderRadius="3px" mb="20px" p="12px">
      <CollapsibleContainer
        title={
          <Title m="0px" variant="h6" fontWeight="bold">
            {formatMessage(messages.sortBy).toUpperCase()}
          </Title>
        }
        isOpenByDefault
      >
        <Box display="block" width="100%" mt="12px">
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
      </CollapsibleContainer>
    </Box>
  );
};

export default SortingBox;
