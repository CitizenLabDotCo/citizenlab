import React, { useState } from 'react';

import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Title,
  Tr,
  colors,
} from '@citizenlab/cl2-component-library';

import { OpinionGroupsAttributes } from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { colorForIndex, formatShare } from './utils';

interface Props {
  attributes: OpinionGroupsAttributes;
}

// Table twin of the charts: every number on the page is also readable here.
const StatementsTable = ({ attributes }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [open, setOpen] = useState(false);

  const rows = [...attributes.statements].sort(
    (a, b) =>
      b.votes.up +
      b.votes.down +
      b.votes.neutral -
      (a.votes.up + a.votes.down + a.votes.neutral)
  );

  return (
    <Box
      p="16px"
      bgColor="white"
      border={`1px solid ${colors.grey300}`}
      borderRadius="3px"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title variant="h3" m="0" color="textPrimary">
          <FormattedMessage {...messages.allStatementsTitle} />
        </Title>
        <Button buttonStyle="secondary" size="s" onClick={() => setOpen(!open)}>
          {formatMessage(open ? messages.hideTable : messages.showTable)}
        </Button>
      </Box>
      {open && (
        <Box mt="12px" overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>{formatMessage(messages.input)}</Th>
                <Th>{formatMessage(messages.totalReactions)}</Th>
                {attributes.groups.map((group) => (
                  <Th key={group.id}>
                    <span style={{ color: colorForIndex(group.id) }}>
                      {group.name}
                    </span>{' '}
                    {formatMessage(messages.agreeShare)}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((statement) => (
                <Tr key={statement.id}>
                  <Td>{localize(statement.title_multiloc)}</Td>
                  <Td>
                    {statement.votes.up} / {statement.votes.down} /{' '}
                    {statement.votes.neutral}
                  </Td>
                  {attributes.groups.map((group) => {
                    const share = statement.group_agree_share[group.id];
                    return (
                      <Td key={group.id}>
                        {share === null
                          ? formatMessage(messages.tooFewVotes)
                          : formatShare(share)}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default StatementsTable;
