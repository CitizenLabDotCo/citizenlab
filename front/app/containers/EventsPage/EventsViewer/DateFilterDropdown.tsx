import React, { useState } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { useSearchParams } from 'react-router-dom';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { Box } from '@citizenlab/cl2-component-library';

type InputProps = {
  title: string | JSX.Element;
  onChange: (dateFilterValue: string[]) => void;
  textColor?: string;
  filterSelectorStyle?: 'button' | 'text';
  listTop?: string;
  mobileLeft?: string;
};

type Props = InputProps;

const DateFilterDropdown = ({
  onChange,
  textColor,
  filterSelectorStyle,
  listTop,
  mobileLeft,
}: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('time_period');

  const dateFilterFromUrl: string[] = dateParam ? JSON.parse(dateParam) : null;

  const [selectedValue, setSelectedValue] = useState<string[]>(
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
  if (options && options.length > 0) {
    return (
      <Box mr="8px">
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
          filterSelectorStyle={filterSelectorStyle}
          top={listTop}
        />
      </Box>
    );
  }

  return null;
};

export default DateFilterDropdown;
