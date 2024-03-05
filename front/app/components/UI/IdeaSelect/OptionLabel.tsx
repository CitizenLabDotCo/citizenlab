import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// utils
import { optionIsIdea } from './utils';

// typings
import { Option } from './typings';
import useLocalize from 'hooks/useLocalize';

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
  const localize = useLocalize();

  if (optionIsIdea(option)) {
    return <Box>{localize(option.attributes.title_multiloc)}</Box>;
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
