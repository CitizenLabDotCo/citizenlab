import React, { useState } from 'react';

import { Dropdown, fontSizes } from '@citizenlab/cl2-component-library';
import { Canvg } from 'canvg';
import { saveAs } from 'file-saver';
import { findDOMNode } from 'react-dom';
import styled from 'styled-components';
import * as XLSX from 'xlsx';

import { IResolution } from 'components/admin/ResolutionControl';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/requestBlob';
import { truncate } from 'utils/textUtils';

import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  display: flex;
  align-items: end;
  position: relative;
  cursor: pointer;
`;

const StyledButton = styled(ButtonWithLink)`
  button {
    display: flex !important;
    justify-content: flex-start !important;
  }
`;

export interface ReportExportMenuProps {
  className?: string;
  name: string;
  svgNode?: React.RefObject<any> | React.RefObject<any>[];
  startAt?: string | null | undefined;
  endAt?: string | null;
  resolution?: IResolution;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentTopicFilter?: string | undefined;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
  xlsx?: XlsxConfig;
}

type XlsxConfig = XlsxConfigEndpoint | XlsxConfigData | XlsxConfigOnDownload;

interface XlsxConfigEndpoint {
  endpoint: string;
}

interface XlsxConfigData {
  data: XlsxData;
}

interface XlsxConfigOnDownload {
  onDownload: () => Promise<XlsxData>;
}

export type XlsxData = Record<string, Record<string, any>[]>;

const ReportExportMenu = ({
  svgNode,
  className,
  name,
  startAt,
  endAt,
  resolution,
  currentGroupFilter,
  currentTopicFilter,
  currentProjectFilter,
  currentGroupFilterLabel,
  currentTopicFilterLabel,
  currentProjectFilterLabel,
  xlsx,
}: ReportExportMenuProps) => {
  const { formatMessage, formatDate } = useIntl();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [exportingXls, setExportingXls] = useState(false);

  const readableDate = (date: string) => {
    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fileName = `${name}${
    startAt
      ? `_${formatMessage(messages.fromFilter)}-${readableDate(startAt)}`
      : ''
  }${
    endAt
      ? `_${formatMessage(messages.untilFilter)}-${readableDate(endAt)}`
      : ''
  }${
    currentProjectFilterLabel
      ? `_${formatMessage(messages.projectFilter)}-${currentProjectFilterLabel}`
      : ''
  }${
    currentGroupFilterLabel
      ? `_${formatMessage(messages.groupFilter)}-${currentGroupFilterLabel}`
      : ''
  }${
    currentTopicFilterLabel
      ? `_${formatMessage(messages.topicFilter)}-${currentTopicFilterLabel}`
      : ''
  }`;

  const handleDownloadSvg = () => {
    const svgNodes =
      svgNode instanceof Array ? svgNode : svgNode ? [svgNode] : [];

    svgNodes.forEach((svgNode_, i) => {
      // eslint-disable-next-line react/no-find-dom-node
      const node = findDOMNode(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        svgNode_ && svgNode_.current.container.children[0]
      );
      if (node) {
        const svgContent = new XMLSerializer().serializeToString(node);
        const svgBlob = new Blob([svgContent], {
          type: 'image/svg+xml;charset=utf-8',
        });
        setDropdownOpened(false);
        saveAs(svgBlob, `${fileName}${i === 0 ? '' : `_${i}`}.svg`);
      }
    });

    trackEventByName(tracks.clickPng, { graph: name });
  };

  const handleDownloadPng = async () => {
    const svgNodes =
      svgNode instanceof Array ? svgNode : svgNode ? [svgNode] : [];

    svgNodes.forEach(async (svgNode_, i) => {
      // eslint-disable-next-line react/no-find-dom-node
      const node = findDOMNode(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        svgNode_ && svgNode_.current.container.children[0]
      );
      if (node) {
        // Create copy of node to trick TS (doesn't seem to understand that this will be always be a SVG)
        const copy = node.cloneNode(true) as SVGElement;

        // Get aspect ratio
        const width = (node as SVGElement).clientWidth;
        const height = (node as SVGElement).clientHeight;

        const aspectRatio = width / height;

        // Increase width and height for better resolution
        const newWidth = aspectRatio > 1 ? 4000 : aspectRatio * 4000;
        const newHeight = aspectRatio <= 1 ? 4000 : (1 / aspectRatio) * 4000;

        copy.setAttribute('width', String(newWidth));
        copy.setAttribute('height', String(newHeight));

        // Convert SVG to string
        const svgContent = new XMLSerializer().serializeToString(copy);

        // Create canvas
        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Start SVG rendering with animations and mouse handling
        const v = await Canvg.fromString(ctx, svgContent);
        v.start();

        // Convert the Canvas to an image
        const link = document.createElement('a');
        link.setAttribute(
          'download',
          `${fileName}${i === 0 ? '' : `_${i}`}.png`
        );
        link.setAttribute(
          'href',
          canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
        );
        link.click();
      }
    });

    trackEventByName(tracks.clickPng, { graph: name });
  };

  const toggleDropdown = (value?: boolean) => () => {
    setDropdownOpened(value || !dropdownOpened);
  };

  const downloadXlsxData = (data: XlsxData, fileName: string) => {
    const workbook = XLSX.utils.book_new();

    Object.entries(data).forEach(([sheet_name, sheet_data]) => {
      // Added after production bug.
      // Error from XLSX package: sheet names can't contain characters from the following array:
      // [':', ']', '[', '*', '?', '/', '\\']
      const sheetNameWithoutForbiddenChars = sheet_name.replace(
        /[:\][*?/\\]/g,
        '_'
      );
      const worksheet = XLSX.utils.json_to_sheet(sheet_data);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        truncate(sheetNameWithoutForbiddenChars, 31)
      );
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const downloadXlsx = async () => {
    setExportingXls(true);

    if (xlsx && 'endpoint' in xlsx) {
      const { endpoint } = xlsx;

      try {
        const blob = await requestBlob(
          endpoint,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          {
            start_at: startAt,
            end_at: endAt,
            interval: resolution,
            project: currentProjectFilter,
            group: currentGroupFilter,
            topic: currentTopicFilter,
          }
        );

        if (blob.size <= 2467) {
          throw new Error(`Empty xlsx : ${endpoint}`);
        }
        saveAs(blob, `${fileName}.xlsx`);
        setDropdownOpened(false);
      } catch (error) {
        reportError(error);
      }
    } else if (xlsx && 'data' in xlsx) {
      const { data } = xlsx;

      downloadXlsxData(data, fileName);
    } else if (xlsx && 'onDownload' in xlsx) {
      const xlsxData = await xlsx.onDownload();

      downloadXlsxData(xlsxData, fileName);
    }

    setExportingXls(false);

    // track this click for user analytics
    trackEventByName(tracks.clickXlsx, { graph: name });
  };

  return (
    <Container className={`${className} intercom-admin-export-button`}>
      <ButtonWithLink
        buttonStyle="admin-dark-text"
        onClick={toggleDropdown()}
        icon="download"
        iconPos="right"
        padding="10px"
      />
      <Dropdown
        width="100%"
        top="35px"
        right="-5px"
        mobileRight="-5px"
        opened={dropdownOpened}
        onClickOutside={toggleDropdown(false)}
        content={
          <>
            {svgNode && (
              <StyledButton
                onClick={handleDownloadSvg}
                buttonStyle="text"
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.downloadSvg} />
              </StyledButton>
            )}
            {svgNode && (
              <StyledButton
                onClick={handleDownloadPng}
                buttonStyle="text"
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.downloadPng} />
              </StyledButton>
            )}
            {xlsx && (
              <StyledButton
                onClick={downloadXlsx}
                buttonStyle="text"
                processing={exportingXls}
                padding="0"
                fontSize={`${fontSizes.s}px`}
              >
                <FormattedMessage {...messages.downloadXlsx} />
              </StyledButton>
            )}
          </>
        }
      />
    </Container>
  );
};

export default ReportExportMenu;
