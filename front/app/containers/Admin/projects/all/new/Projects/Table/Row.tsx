import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';

import usePhaseMini from 'api/phases_mini/usePhaseMini';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  project: ProjectMiniAdminData;
}

const Row = ({ project }: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhaseMini(
    project.relationships.current_phase?.data?.id
  );

  const { title_multiloc, folder_title_multiloc, first_phase_start_date } =
    project.attributes;

  const getCurrentPhaseText = () => {
    if (phase) {
      return phase.data.attributes.participation_method;
    }

    const projectStartingInFuture =
      first_phase_start_date === null ||
      new Date(first_phase_start_date) > new Date();

    return projectStartingInFuture ? 'Pre-launch' : 'Ended';
  };

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
          {getCurrentPhaseText()}
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
