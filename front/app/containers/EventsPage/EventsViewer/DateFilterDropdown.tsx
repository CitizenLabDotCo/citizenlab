import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import FilterSelector from 'components/FilterSelector';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  onChange: (dateFilterValue: string[]) => void;
  textColor?: string;
  listTop?: string;
  mobileLeft?: string;
};

const DateFilterDropdown = ({
  onChange,
  textColor,
  listTop,
  mobileLeft,
}: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('time_period');

  const dateFilterFromUrl: string[] = dateParam ? JSON.parse(dateParam) : null;

  const [selectedValue, setSelectedValue] = useState<string[]>(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    dateFilterFromUrl || []
  );

  const handleOnChange = (selectedValue) => {
    setSelectedValue(selectedValue);
    onChange(selectedValue);
  };

  const options = [
    { text: formatMessage(messages.today), value: 'today' },
    { text: formatMessage(messages.thisWeek), value: 'week' },
    { text: formatMessage(messages.thisMonth), value: 'month' },
    { text: formatMessage(messages.allTime), value: 'all' },
  ];
  return (
    <Box id="e2e-event-date-filter">
      <FilterSelector
        id="e2e-date-filter-selector"
        title={formatMessage(messages.date)}
        name="dates"
        selected={selectedValue}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={false}
        right="-10px"
        mobileLeft={mobileLeft ? mobileLeft : '-5px'}
        textColor={textColor}
        filterSelectorStyle="button"
        top={listTop}
        minWidth="130px"
      />
    </Box>
  );
};

export default DateFilterDropdown;
