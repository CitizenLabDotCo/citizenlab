import React from 'react';

import { Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import usePhaseMini from 'api/phases_mini/usePhaseMini';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import clHistory from 'utils/cl-router/history';
import { parseBackendDateString } from 'utils/dateUtils';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  project: ProjectMiniAdminData;
}

const Row = ({ project }: Props) => {
  const localize = useLocalize();
  const locale = useLocale();
  const { data: phase } = usePhaseMini(
    project.relationships.current_phase?.data?.id
  );

  const {
    first_phase_start_date,
    folder_title_multiloc,
    last_phase_end_date,
    publication_status,
    title_multiloc,
    visible_to,
  } = project.attributes;

  const getCurrentPhaseText = () => {
    if (phase) {
      return phase.data.attributes.participation_method;
    }

    const projectStartingInFuture =
      first_phase_start_date === null ||
      new Date(first_phase_start_date) > new Date();

    return projectStartingInFuture ? 'Pre-launch' : 'Ended';
  };

  const formatDate = (date: string | null) => {
    const parsedDate = parseBackendDateString(date ?? undefined);
    if (!parsedDate) return '';
    return format(parsedDate, 'P', { locale: getLocale(locale) });
  };

  return (
    <Tr>
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/${project.id}`);
        }}
      >
        <Text
          m="0"
          fontSize="s"
          color="primary"
          className="project-table-row-title"
        >
          {localize(title_multiloc)}
        </Text>
        {folder_title_multiloc && (
          <Text m="0" fontSize="xs" color="textSecondary">
            {localize(folder_title_multiloc)}
          </Text>
        )}
      </StyledTd>
      <Td background={colors.grey50} width="140px">
        <Text m="0" fontSize="s" color="primary">
          {getCurrentPhaseText()}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatDate(first_phase_start_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatDate(last_phase_end_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="140px">
        <Text m="0" fontSize="s" color="primary">
          {publication_status}
        </Text>
      </Td>
      <Td background={colors.grey50} width="140px">
        <Text m="0" fontSize="s" color="primary">
          {visible_to}
        </Text>
      </Td>
    </Tr>
  );
};

export default Row;
