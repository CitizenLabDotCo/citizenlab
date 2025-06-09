import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  project: ProjectMiniAdminData;
}

const Row = ({ project }: Props) => {
  const localize = useLocalize();

  const { title_multiloc, folder_title_multiloc } = project.attributes;

  return (
    <Tr>
      <Td background={colors.grey50}>
        <Text m="0" fontSize="s" color="primary">
          {localize(title_multiloc)}
        </Text>
        {folder_title_multiloc && (
          <Text m="0" fontSize="xs" color="textSecondary">
            {localize(folder_title_multiloc)}
          </Text>
        )}
      </Td>
      <Td background={colors.grey50}>
        <Text m="0" fontSize="s" color="primary">
          Bla
        </Text>
      </Td>
      <Td background={colors.grey50}>
        <Text m="0" fontSize="s" color="primary">
          Bla
        </Text>
      </Td>
    </Tr>
  );
};

export default Row;
