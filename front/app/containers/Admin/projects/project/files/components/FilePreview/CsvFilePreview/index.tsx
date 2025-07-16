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
  Button,
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

const StyledBox = styled(Box)`
  transform: rotateX(180deg);
  cursor: grab;

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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Multiply by 2 for faster scrolling
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Add global mouse events for when mouse leaves the container while dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  if (loadingFile) {
    return <Spinner />;
  }

  // If the file is too large, display a warning and download option
  if (isTooLarge) {
    return (
      <Box py="12px">
        <Text fontStyle="italic" color="coolGrey600">
          {formatMessage(messages.csvPreviewTooLarge, {
            size: maxFileSizeMB,
          })}
        </Text>
        <Box display="flex">
          <Button
            mt="12px"
            buttonStyle="admin-dark"
            onClick={() => window.open(url, '_blank')}
            text={formatMessage(messages.downloadFile)}
            fontSize="s"
            p="4px 8px"
          />
        </Box>
      </Box>
    );
  }

  // If there was an error reading the file or if no rows were parsed,
  // display an error message and a download button.
  if (fileReadError || rows.length === 0) {
    return (
      <Box py="12px">
        <Text fontStyle="italic" color="coolGrey600">
          {formatMessage(messages.csvPreviewError)}
        </Text>
        <DownloadFileButton url={url} />
      </Box>
    );
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return (
    <>
      <Box>
        <Text m="0px" mt="24px" color="coolGrey600" fontStyle="italic">
          {formatMessage(messages.csvPreviewLimit)}
        </Text>
        <Box display="flex">
          <Button
            mt="12px"
            buttonStyle="admin-dark"
            onClick={() => window.open(url, '_blank')}
            text={formatMessage(messages.downloadFile)}
            fontSize="s"
            p="4px 8px"
          />
        </Box>
      </Box>
      <Box
        mt="30px"
        overflowX="auto"
        transform="rotateX(180deg)"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <StyledBox>
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
        </StyledBox>
      </Box>
    </>
  );
};

export default CsvFilePreview;
