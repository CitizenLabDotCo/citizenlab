import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Tr,
  Th,
  Tbody,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Row from './Row';

const Table = () => {
  const { formatMessage } = useIntl();

  const { data } = useProjectsMiniAdmin({
    sort: 'phase_starting_or_ending_soon',
  });

  const projects = data?.pages.map((page) => page.data).flat();

  return (
    <TableComponent
      border={`1px solid ${colors.grey300}`}
      borderRadius={stylingConsts.borderRadius}
      innerBorders={{
        bodyRows: true,
      }}
    >
      <Thead>
        <Tr background={colors.grey50}>
          <Th py="16px">{formatMessage(messages.project)}</Th>
          <Th py="16px">{formatMessage(messages.currentPhase)}</Th>
          <Th py="16px">{formatMessage(messages.projectStart)}</Th>
          <Th py="16px">{formatMessage(messages.projectEnd)}</Th>
          <Th py="16px">{formatMessage(messages.status)}</Th>
          <Th py="16px">{formatMessage(messages.visibility)}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {projects?.map((project) => (
          <Row project={project} key={project.id} />
        ))}
      </Tbody>
    </TableComponent>
  );
};

export default Table;
