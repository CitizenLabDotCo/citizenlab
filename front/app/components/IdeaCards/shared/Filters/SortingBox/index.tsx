import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearch } from '@tanstack/react-router';

import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import InputFilterCollapsible from 'components/FilterBoxes/InputFilterCollapsible';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SortTypeButton from './SortTypeButton';
import { getLabelForSortingOption } from './utils';

type SortingBoxProps = {
  handleSortOnChange: (sort: IdeaSortMethod) => void;
  phaseId?: string;
};
const SortingBox = ({ handleSortOnChange, phaseId }: SortingBoxProps) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const phaseDefaultSort = phase?.data.attributes.ideas_order;

  const { sort } = useSearch({ strict: false });
  const currentSortType =
    (sort as IdeaSortMethod | undefined) || phaseDefaultSort || 'trending';

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
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage
          {...messages.sortChangedScreenreaderMessage}
          values={{
            currentSortType: formatMessage(
              getLabelForSortingOption(currentSortType)
            ),
          }}
        />
      </ScreenReaderOnly>
    </InputFilterCollapsible>
  );
};

export default SortingBox;
