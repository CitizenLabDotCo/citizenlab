import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Parameter } from '../params';

import messages from './messages';
import { FilterConfig } from './typings';

interface Props {
  availableFilters: FilterConfig[];
  onAddFilter: (filterKey: Parameter) => void;
}

const AddFilterDropdown = ({ availableFilters, onAddFilter }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddFilter = (filterType: Parameter) => {
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
    <Box display="flex" justifyContent="center">
      <Button
        buttonStyle="text"
        icon="plus"
        onClick={() => setIsOpen(!isOpen)}
        text={formatMessage(messages.addFilter)}
        iconSize="20px"
      />
      <Dropdown
        opened={isOpen}
        onClickOutside={() => setIsOpen(false)}
        content={
          <Box>
            {availableFilters.map((filter, index) => (
              <DropdownListItem
                key={index}
                onClick={() => handleAddFilter(filter.key)}
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
