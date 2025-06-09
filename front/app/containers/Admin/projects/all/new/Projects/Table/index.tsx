import React from 'react';

import {
  Table as TableComponent,
  Thead,
  Text,
  Tr,
  Th,
  Tbody,
  Td,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useProjectsMiniAdmin from 'api/projects_mini_admin/useProjectsMiniAdmin';

import useLocalize from 'hooks/useLocalize';

const Table = () => {
  const localize = useLocalize();

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
          <Th py="16px">Project</Th>
          <Th py="16px">Another col</Th>
          <Th py="16px">Last col</Th>
        </Tr>
      </Thead>
      <Tbody>
        {projects?.map(
          ({ attributes: { title_multiloc, folder_title_multiloc } }, i) => (
            <Tr key={i}>
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
          )
        )}
      </Tbody>
    </TableComponent>
  );
};

export default Table;
