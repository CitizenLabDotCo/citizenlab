import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';

import { Option } from './typings';
import { optionIsIdea } from './utils';

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
