import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { Option } from './typings';
import { optionIsUser } from './utils';

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
    const { last_name, first_name, email } = option.attributes;

    return (
      <Box
        display="flex"
        alignItems="center"
        data-cy={`e2e-user-${option.attributes.email}`}
      >
        {`${last_name}, ${first_name}${email ? ` (${email})` : ''}`}
      </Box>
    );
  }

  if (option.value === 'loadMore' && hasNextPage) {
    return (
      <ButtonWithLink
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
