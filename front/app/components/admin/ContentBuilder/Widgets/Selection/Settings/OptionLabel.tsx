import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { IAdminPublicationData } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

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
    if (option.relationships.publication.data.type === 'project') {
      return (
        <Box>{localize(option.attributes.publication_title_multiloc)}</Box>
      );
    } else {
      return (
        <Box display="flex" alignItems="center">
          <Icon
            name="folder-outline"
            m="0"
            mr="8px"
            ml="-2px"
            fill={colors.textSecondary}
          />
          {localize(option.attributes.publication_title_multiloc)}
        </Box>
      );
    }
  }

  if (hasNextPage) {
    return (
      <ButtonWithLink
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          fetchNextPage();
        }}
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
