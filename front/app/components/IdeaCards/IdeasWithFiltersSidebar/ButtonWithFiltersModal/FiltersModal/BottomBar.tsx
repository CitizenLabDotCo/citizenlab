import React, { memo, FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import { Props as InputFiltersProps } from '../../InputFilters';

import messages from './messages';

interface Props {
  onClick: (event: FormEvent) => void;
  selectedIdeaFilters: InputFiltersProps['selectedIdeaFilters'];
}

const BottomBar = memo<Props>(({ onClick, selectedIdeaFilters }) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);

  if (!ideasFilterCounts) return null;

  return (
    <Box
      background={colors.white}
      p="16px"
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
    </Box>
  );
});

export default BottomBar;
