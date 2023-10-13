import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// utils
import { optionIsUser } from './utils';

// typings
import { Option } from './typings';

interface OptionLabelProps {
  option: Option;
  hasNextPage?: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
}

const OptionLabel = ({
  option,
  hasNextPage,
  isLoading,
  fetchNextPage,
}: OptionLabelProps) => {
  if (optionIsUser(option)) {
    return (
      <Box
        display="flex"
        alignItems="center"
        data-cy={`e2e-user-${option.attributes.email}`}
      >
        {option.attributes.last_name}, {option.attributes.first_name} (
        {option.attributes.email})
      </Box>
    );
  }

  if (option.value === 'loadMore' && hasNextPage) {
    return (
      <Button
        onClick={fetchNextPage}
        processing={isLoading}
        icon="refresh"
        buttonStyle="text"
        padding="0px"
      />
    );
  }

  return null;
};

export default OptionLabel;
