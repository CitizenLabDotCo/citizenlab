import React from 'react';

import { Box, Icon, colors, Text } from '@citizenlab/cl2-component-library';

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

const ReportAdminPublicationOptionLabel = ({
  option,
  hasNextPage,
  isLoading,
  fetchNextPage,
}: Props) => {
  const localize = useLocalize();

  if (!option) return null;

  if (isAdminPublication(option)) {
    const isFolder = option.relationships.publication.data.type === 'folder';

    return (
      <Box display="flex" alignItems="center" gap="8px">
        <Icon
          name={isFolder ? 'folder-outline' : 'projects'}
          fill={colors.textSecondary}
          width="20px"
        />
        <Text m="0" color="textPrimary" style={{ flex: 1 }}>
          {localize(option.attributes.publication_title_multiloc)}
        </Text>
      </Box>
    );
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

export default ReportAdminPublicationOptionLabel;
