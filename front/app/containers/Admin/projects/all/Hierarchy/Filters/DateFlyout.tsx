import React from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import messages from '../messages';

import { FACETS } from './facets';
import useFilters from './useFilters';

interface Props {
  level: Level;
  takeFocus: boolean;
}

// The project start date, from and to. Either end can be left open.
const DateFlyout = ({ level, takeFocus }: Props) => {
  const { formatMessage } = useIntl();
  const { minStartDate, maxStartDate, setDates } = useFilters(level);

  return (
    <Box
      role="group"
      aria-label={formatMessage(FACETS.start_date.label)}
      display="flex"
      flexDirection="column"
      gap="8px"
      p="4px"
    >
      <Input
        id="projects-start-date-from"
        autoFocus={takeFocus}
        type="date"
        size="small"
        label={formatMessage(messages.from)}
        value={minStartDate}
        max={maxStartDate}
        onChange={(from) => setDates(from || undefined, maxStartDate)}
      />
      <Input
        id="projects-start-date-to"
        type="date"
        size="small"
        label={formatMessage(messages.to)}
        value={maxStartDate}
        min={minStartDate}
        onChange={(to) => setDates(minStartDate, to || undefined)}
      />
    </Box>
  );
};

export default DateFlyout;
