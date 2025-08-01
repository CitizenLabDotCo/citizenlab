import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { FilterKey, FILTER_CONFIG } from './constants';
import messages from './Filters/messages';

interface Props {
  availableFilters: FilterKey[];
  onAddFilter: (filterKey: FilterKey) => void;
}

const AddFilterDropdown = ({ availableFilters, onAddFilter }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddFilter = (filterKey: FilterKey) => {
    onAddFilter(filterKey);
    setIsOpen(false);
  };

  // If no filters are available, show a disabled button with tooltip
  if (availableFilters.length === 0) {
    return (
      <Tooltip content={formatMessage(messages.noMoreFilters)}>
        <Button
          buttonStyle="text"
          icon="plus"
          text={formatMessage(messages.addFilter)}
          disabled
          m="0"
          ml="-16px"
        />
      </Tooltip>
    );
  }

  return (
    <Box display="flex" justifyContent="center">
      <Button
        buttonStyle="text"
        icon="plus"
        onClick={() => setIsOpen(!isOpen)}
        text={formatMessage(messages.addFilter)}
        iconSize="20px"
        m="0"
        ml="-16px"
      />
      <Dropdown
        opened={isOpen}
        onClickOutside={() => setIsOpen(false)}
        content={
          <Box>
            {availableFilters.map((filterKey, index) => (
              <DropdownListItem
                key={index}
                onClick={() => handleAddFilter(filterKey)}
              >
                {formatMessage(FILTER_CONFIG[filterKey])}
              </DropdownListItem>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default AddFilterDropdown;
