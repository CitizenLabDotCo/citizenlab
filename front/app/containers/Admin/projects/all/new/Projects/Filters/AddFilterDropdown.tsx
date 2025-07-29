import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
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
