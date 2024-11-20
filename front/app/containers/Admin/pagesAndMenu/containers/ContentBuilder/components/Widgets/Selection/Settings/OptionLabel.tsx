import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IAdminPublicationData } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';

import { LoadMore, isAdminPublication } from './utils';

interface Props {
  option?: IAdminPublicationData | LoadMore;
  hasNextPage?: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
}

const OptionLabel = ({
  option,
  hasNextPage,
  isLoading,
  fetchNextPage,
}: Props) => {
  const localize = useLocalize();

  if (!option) return null;

  if (isAdminPublication(option)) {
    return <Box>{localize(option.attributes.publication_title_multiloc)}</Box>;
  }

  if (hasNextPage) {
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
