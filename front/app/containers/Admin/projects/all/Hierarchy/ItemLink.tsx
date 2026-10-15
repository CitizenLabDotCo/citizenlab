import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import Link from 'utils/cl-router/Link';

import { Level } from './level';
import useLevelSearch from './useLevelSearch';

interface Props {
  titleMultiloc: Multiloc;
  target: { level: Level } | { projectId: string };
}

// A plain link to a space, folder or project. The grid and the list replace it.
const ItemLink = ({ titleMultiloc, target }: Props) => {
  const localize = useLocalize();
  const levelSearch = useLevelSearch();
  const title = localize(titleMultiloc);

  return (
    <Box py="4px">
      <Text m="0" fontSize="s">
        {'projectId' in target ? (
          <Link
            to="/admin/projects/$projectId"
            params={{ projectId: target.projectId }}
          >
            {title}
          </Link>
        ) : (
          <Link to="/admin/projects" search={levelSearch(target.level)}>
            {title}
          </Link>
        )}
      </Text>
    </Box>
  );
};

export default ItemLink;
