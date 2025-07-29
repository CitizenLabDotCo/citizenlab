import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { FilterType } from './DynamicFilters';
import messages from './messages';

interface FilterConfig {
  type: FilterType;
  label: string;
  paramKey: string;
  component: React.ComponentType<any>;
}

interface Props {
  availableFilters: FilterConfig[];
  onAddFilter: (filterType: FilterType) => void;
}

const AddFilterDropdown = ({ availableFilters, onAddFilter }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddFilter = (filterType: FilterType) => {
    onAddFilter(filterType);
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
        />
      </Tooltip>
    );
  }

  return (
    <Box position="relative">
      <Button
        buttonStyle="text"
        icon="plus"
        onClick={() => setIsOpen(!isOpen)}
        text={formatMessage(messages.addFilter)}
      />
      <Dropdown
        opened={isOpen}
        onClickOutside={() => setIsOpen(false)}
        content={
          <Box>
            {availableFilters.map((filter, index) => (
              <DropdownListItem
                key={index}
                onClick={() => handleAddFilter(filter.type)}
              >
                {filter.label}
              </DropdownListItem>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default AddFilterDropdown;
