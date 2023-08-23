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
  onChange: (projectIds: string[]) => void;
  className?: string;
  textColor?: string;
  filterSelectorStyle?: 'button' | 'text';
  listTop?: string;
  mobileLeft?: string;
  eventsTime?: 'past' | 'currentAndFuture';
};

type Props = InputProps;

const DateFilterDropdown = ({
  onChange,
  className,
  textColor,
  filterSelectorStyle,
  listTop,
  mobileLeft,
  eventsTime,
}: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const projectIdsParam =
    eventsTime === 'past'
      ? searchParams.get('past_dates')
      : searchParams.get('ongoing_dates');

  const projectIdsFromUrl: string[] = projectIdsParam
    ? JSON.parse(projectIdsParam)
    : null;

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleOnChange = (selectedValues) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  };

  const options = [
    { text: formatMessage(messages.today), value: 'today' },
    { text: formatMessage(messages.thisWeek), value: 'this_week' },
    { text: formatMessage(messages.thisMonth), value: 'this_month' },
  ];
  if (options && options.length > 0) {
    return (
      <Box mr="8px">
        <FilterSelector
          id="e2e-project-filter-selector"
          className={className}
          title={formatMessage(messages.date)}
          name="dates"
          selected={selectedValues}
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
