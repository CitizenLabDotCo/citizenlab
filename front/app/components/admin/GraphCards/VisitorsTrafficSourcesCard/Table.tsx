import React, { useState } from 'react';

import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  colors,
  stylingConsts,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import Pagination from 'components/Pagination';

import { FormattedMessage } from 'utils/cl-intl';
import { truncate } from 'utils/textUtils';

import messages from './messages';
import ReferrerListLink from './RefferListLink';
import { TranslatedReferrers } from './useVisitorReferrerTypes/parse';

type Props = {
  tableData: TranslatedReferrers;
  onOpenModal?: () => void;
};

const PAGE_SIZE = 10;

const TableComponent = ({ tableData, onOpenModal }: Props) => {
  const [pageNumber, setPageNumber] = useState<number>(1);

  const paginatedData = tableData.slice(
    (pageNumber - 1) * PAGE_SIZE,
    pageNumber * PAGE_SIZE
  );

  return (
    <Box px="20px">
      <Table
        border={`1px solid ${colors.grey300}`}
        borderRadius={stylingConsts.borderRadius}
        innerBorders={{
          bodyRows: true,
        }}
      >
        <Thead>
          <Tr background={colors.grey50}>
            <Th py="16px">
              <FormattedMessage {...messages.referrer} />
            </Th>
            <Th py="16px">
              <FormattedMessage {...messages.visits} />
            </Th>
            <Th py="16px">
              <FormattedMessage {...messages.visitors} />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedData.map((row, i) => (
            <Tr key={i}>
              <Td background={colors.grey50}>
                {row.referrer.length <= 70 ? (
                  <Text
                    m="0px"
                    color="primary"
                    fontSize="s"
                    wordBreak="break-word"
                  >
                    ({row.referrer_type}) {row.referrer}
                  </Text>
                ) : (
                  <>
                    <Text
                      m="0px"
                      color="primary"
                      fontSize="s"
                      wordBreak="break-word"
                    >
                      ({row.referrer_type}) {truncate(row.referrer, 70)}
                    </Text>{' '}
                    <IconTooltip
                      content={
                        <Text wordBreak="break-word" color="white" fontSize="s">
                          {row.referrer}
                        </Text>
                      }
                      icon="info-outline"
                      placement="bottom"
                    />
                  </>
                )}
              </Td>
              <Td>{row.visits}</Td>
              <Td>{row.visitors}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Box
        mt="40px"
        display="flex"
        flexDirection="row-reverse"
        justifyContent="space-between"
        alignItems="center"
      >
        {tableData.length > PAGE_SIZE && (
          <Pagination
            currentPage={pageNumber}
            totalPages={Math.ceil(tableData.length / PAGE_SIZE)}
            loadPage={setPageNumber}
          />
        )}

        {onOpenModal && <ReferrerListLink onOpenModal={onOpenModal} />}
      </Box>
    </Box>
  );
};

export default TableComponent;
