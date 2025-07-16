import React, { useEffect, useState, useRef } from 'react';

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

import { useIntl } from 'utils/cl-intl';

import DownloadFileButton from '../../DownloadFileButton';
import messages from '../messages';

const MAX_ROWS = 50; // Default max rows to read from CSV
const MAX_FILE_SIZE_MB = 2; // Default max file size in MB

type Props = {
  url: string;
  fileSize?: number; // in bytes
};

const ScrollableTableContainer = styled(Box)`
  transform: rotateX(
    180deg
  ); /* Rotation to allow the X scroll bar on the top */
  cursor: grab;
  user-select: none; /* Prevent text selection in the table when draging to scroll */

  &:active {
    cursor: grabbing;
  }
`;

const CsvFilePreview = ({ url, fileSize }: Props) => {
  const { formatMessage } = useIntl();

  const [rows, setRows] = useState<string[][]>([]);
  const [fileReadError, setFileReadError] = useState(false);
  const [loadingFile, setLoadingFile] = useState(true);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({
    clickLocation: 0,
    scrollLeft: 0,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 0;
  const isTooLarge = fileSize !== undefined && fileSizeMB > MAX_FILE_SIZE_MB;

  useEffect(() => {
    if (isTooLarge) {
      setLoadingFile(false);
      return;
    }

    fetch(url)
      .then((res) => res.text())
      .then((csvText) => {
        // Parse the CSV text using PapaParse.
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

  // Drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setDragState({
      clickLocation: e.pageX - scrollContainerRef.current.offsetLeft, // Where the user clicked when starting to drag
      scrollLeft: scrollContainerRef.current.scrollLeft, // How far the table has already been scrolled horizontally
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return;

      e.preventDefault();

      // Calculate the new scroll position based on mouse movement
      const x = e.pageX - scrollContainerRef.current.offsetLeft; // Current mouse position relative to the container
      const moveDistance = (x - dragState.clickLocation) * 2; // Multiply by 2 for faster scrolling
      scrollContainerRef.current.scrollLeft =
        dragState.scrollLeft - moveDistance;
    };

    const handleMouseUp = () => setIsDragging(false);

    // Prevent text selection of the table content during drag
    const preventSelection = (e: Event) => e.preventDefault();

    // Attach the event liteners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', preventSelection);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventSelection);
    };
  }, [isDragging, dragState]);

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
        <DownloadFileButton url={url} />
      </Box>
    );
  }

  // Successful data load - render table
  const [headers, ...dataRows] = rows;

  return (
    <>
      <Box>
        <Text m="0px" mt="24px" color="coolGrey600" fontStyle="italic">
          {formatMessage(messages.csvPreviewLimit)}
        </Text>
        <DownloadFileButton url={url} />
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
