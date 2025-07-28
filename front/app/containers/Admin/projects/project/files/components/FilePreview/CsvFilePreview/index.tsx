import React, { useEffect, useState } from 'react';

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Box,
} from '@citizenlab/cl2-component-library';
import Papa from 'papaparse';
import styled from 'styled-components';

import { IFileData } from 'api/files/types';

import { useDragToLateralScroll } from 'hooks/useDragToLateralScroll';

import { useIntl } from 'utils/cl-intl';

import DownloadFileButton from '../../DownloadFileButton';
import messages from '../messages';

const MAX_ROWS = 50; // Default max rows to read from the CSV (helps with performance)
const MAX_FILE_SIZE_MB = 2; // Max file size in MB we will allow previews for (helps with performance)

type Props = {
  file: IFileData;
};

const ScrollableTableContainer = styled(Box)`
  transform: rotateX(
    180deg
  ); /* Rotation to allow the X scroll bar on the top */
  cursor: grab;
  user-select: none; /* Prevent text selection in the table when dragging to scroll */

  &:active {
    cursor: grabbing;
  }
`;

const CsvFilePreview = ({ file }: Props) => {
  const url = file.attributes.content.url;
  const fileSize = file.attributes.size; // Size in bytes

  const { formatMessage } = useIntl();

  const [rows, setRows] = useState<string[][]>([]);
  const [fileReadError, setFileReadError] = useState(false);
  const [loadingFile, setLoadingFile] = useState(true);

  // Use the drag-to-scroll hook
  const { scrollContainerRef, handleMouseDown } = useDragToLateralScroll();

  const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 0;
  const isTooLarge = fileSizeMB > MAX_FILE_SIZE_MB;

  useEffect(() => {
    if (isTooLarge) {
      setLoadingFile(false);
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((csvText) => {
        // Parse the CSV text using Papa Parse.
        // We only read a limited number of rows to avoid performance issues.
        const result = Papa.parse<string[]>(csvText, {
          preview: MAX_ROWS,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0) {
          setFileReadError(true);
        } else {
          setRows(result.data);
        }
      })
      .catch(() => setFileReadError(true))
      .finally(() => setLoadingFile(false));
  }, [url, isTooLarge]);

  // Loading state
  if (loadingFile) {
    return <Spinner />;
  }

  // Error states and file too large
  if (isTooLarge || fileReadError || rows.length === 0) {
    const messageKey = isTooLarge
      ? messages.csvPreviewTooLarge
      : messages.csvPreviewError;

    const messageProps = isTooLarge ? { size: MAX_FILE_SIZE_MB } : undefined;

    return (
      <Box py="12px">
        <Text fontStyle="italic" color="coolGrey600">
          {formatMessage(messageKey, messageProps)}
        </Text>
        <DownloadFileButton file={file} />
      </Box>
    );
  }

  // Successful data load - render table
  const [headers, ...dataRows] = rows;

  return (
    <>
      <Box>
        <Text
          m="0px"
          mt="24px"
          color="coolGrey600"
          fontStyle="italic"
          fontSize="s"
        >
          {formatMessage(messages.csvPreviewLimit)}
        </Text>
        <DownloadFileButton file={file} />
      </Box>

      <Box
        mt="30px"
        overflowX="auto"
        transform="rotateX(180deg)" // Rotation to allow the X scroll bar on the top
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
      >
        <ScrollableTableContainer>
          <Table innerBorders={{ bodyRows: true }}>
            <Thead>
              <Tr>
                {headers.map((columnTitle, index) => (
                  <Th key={`header-${index}`}>{columnTitle}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {dataRows.map((row, rowIndex) => (
                <Tr key={`row-${rowIndex}`}>
                  {row.map((cellContent, colIndex) => (
                    <Td key={`cell-${rowIndex}-${colIndex}`}>{cellContent}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ScrollableTableContainer>
      </Box>
    </>
  );
};

export default CsvFilePreview;
