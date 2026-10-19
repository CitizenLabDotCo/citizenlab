import React from 'react';

import {
  Box,
  Icon,
  Th,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import messages from '../messages';

import { COLUMNS, ColumnKey } from './columns';
import { getNextSort, getSortDirection } from './sort';

const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin: 0 -8px;
  border: 0;
  border-radius: 6px;
  background: none;
  cursor: pointer;

  &:hover {
    background: ${colors.grey50};
  }
`;

interface Props {
  column: ColumnKey;
}

const HeaderCell = ({ column }: Props) => {
  const { formatMessage } = useIntl();
  const { sort } = useSearch({ from: '/$locale/admin/projects/' });
  const { label, width, numeric } = COLUMNS[column];
  const direction = getSortDirection(column, sort);
  const text = formatMessage(label);

  // The active column reads darker and bolder.
  const heading = direction ? (
    <Text as="span" m="0" variant="boSection" fontSize="xs">
      {text}
    </Text>
  ) : (
    <Text as="span" m="0" variant="boMicro">
      {text}
    </Text>
  );

  const onSort = () => {
    const next = getNextSort(column, sort);
    if (next) {
      updateSearchParams({ sort: next });
    } else {
      removeSearchParams(['sort']);
    }
  };

  return (
    <Th
      w={width ? `${width}px` : undefined}
      px="8px"
      py="6px"
      aria-sort={
        direction === 'asc'
          ? 'ascending'
          : direction === 'desc'
          ? 'descending'
          : undefined
      }
    >
      <Box display="flex" justifyContent={numeric ? 'flex-end' : 'flex-start'}>
        {COLUMNS[column].sort ? (
          <Tooltip
            content={formatMessage(messages.orderBy, { column: text })}
            placement="bottom"
            theme="dark"
          >
            <SortButton type="button" onClick={onSort}>
              {heading}
              {direction && (
                <Box display="flex" aria-hidden>
                  <Icon
                    name={direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                    width="12px"
                    height="12px"
                    fill={colors.coolGrey500}
                  />
                </Box>
              )}
            </SortButton>
          </Tooltip>
        ) : (
          heading
        )}
      </Box>
    </Th>
  );
};

export default HeaderCell;
