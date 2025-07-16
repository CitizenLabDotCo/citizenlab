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

type Props = {
  url: string;
  fileSize?: number; // in bytes
  maxRows?: number;
  maxFileSizeMB?: number;
};

const ScrollableTableContainer = styled(Box)`
  transform: rotateX(180deg);
  cursor: grab;
  user-select: none; /* Prevent text selection */

  &:active {
    cursor: grabbing;
  }
`;

const CsvFilePreview = ({
  url,
  fileSize,
  maxRows = 50,
  maxFileSizeMB = 2,
}: Props) => {
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
  const isTooLarge = fileSize !== undefined && fileSizeMB > maxFileSizeMB;

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
          preview: maxRows,
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
  }, [url, maxRows, isTooLarge]);

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
      const x = e.pageX - scrollContainerRef.current.offsetLeft; // Current mouse position relative to the container
      const moveDistance = (x - dragState.clickLocation) * 2; // Multiply by 2 for faster scrolling
      scrollContainerRef.current.scrollLeft =
        dragState.scrollLeft - moveDistance;
    };

    const handleMouseUp = () => setIsDragging(false);

    // Prevent text selection during drag
    const preventSelection = (e: Event) => e.preventDefault();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectstart', preventSelection);

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

    const messageProps = isTooLarge ? { size: maxFileSizeMB } : undefined;

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
        transform="rotateX(180deg)"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
      >
        <ScrollableTableContainer>
          <Table innerBorders={{ bodyRows: true }}>
            <Thead>
              <Tr>
                {headers.map((cell, index) => (
                  <Th key={`header-${index}`}>{cell}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {dataRows.map((row, rowIndex) => (
                <Tr key={`row-${rowIndex}`}>
                  {row.map((cell, colIndex) => (
                    <Td key={`cell-${rowIndex}-${colIndex}`}>{cell}</Td>
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
