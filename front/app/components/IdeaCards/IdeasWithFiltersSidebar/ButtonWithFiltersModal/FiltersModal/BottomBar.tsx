import React, { FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import { InputFiltersProps } from '../../InputFilters';
import ResetFiltersButton from '../../ResetFiltersButton';

import messages from './messages';

interface Props {
  onClick: (event: FormEvent) => void;
  selectedIdeaFilters: InputFiltersProps['selectedIdeaFilters'];
  onReset: () => void;
}

const BottomBar = ({ onClick, selectedIdeaFilters, onReset }: Props) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);

  if (!ideasFilterCounts) return null;

  return (
    <Box
      background={colors.white}
      p="16px"
      pb="0"
      flex="1"
      borderTop={`1px solid ${colors.grey300}`}
    >
      <Button onClick={onClick} fullWidth={true}>
        <FormattedMessage
          {...messages.showXResults}
          values={{
            ideasCount: ideasFilterCounts.data.attributes.total,
          }}
        />
      </Button>
      <ResetFiltersButton
        onClick={onReset}
        ideaQueryParameters={selectedIdeaFilters}
      />
    </Box>
  );
};
export default BottomBar;
