import React, { useCallback, useEffect, useState } from 'react';

import { Text, Spinner, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../../messages';

import PaginatedReport from './PaginatedReport';
import Report from './Report';

const PreparingBox = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  background: #fff;
  padding-top: 50px;
  text-align: center;
  z-index: 10000;
  opacity: 0.8;
  @media print {
    display: none;
  }
`;

const EVENTS = [
  'mousemove',
  'mouseenter',
  'mouseover',
  'mouseleave',
  'mouseout',
];

export interface Props {
  reportId: string;
  _print?: boolean; // only used to disable printing in storybook
}

export const PrintReport = ({ reportId, _print = true }: Props) => {
  const [isPrintReady, setIsPrintReady] = useState(false);
  const llmReportingEnabled = useFeatureFlag({ name: 'llm_reporting' });

  const handlePaginated = useCallback(() => setIsPrintReady(true), []);

  // A paginated report says when its pages are drawn. Without pagination there is
  // nothing to wait for, so printing falls back to a fixed delay.
  useEffect(() => {
    if (!_print) return;

    if (isPrintReady) {
      window.print();
    } else if (!llmReportingEnabled) {
      setTimeout(() => {
        setIsPrintReady(true);
      }, 5000);
    }
  }, [_print, isPrintReady, llmReportingEnabled]);

  useEffect(() => {
    if (!_print) return;

    const blockEvent = (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    EVENTS.forEach((event) => {
      document.addEventListener(event, blockEvent, true);
    });

    return () => {
      EVENTS.forEach((event) => {
        document.removeEventListener(event, blockEvent);
      });
    };
  }, [_print]);

  return (
    <>
      {!isPrintReady && _print && (
        <PreparingBox>
          <Spinner />
          <Text color="primary">
            <FormattedMessage {...messages.printPrepare} />
          </Text>
        </PreparingBox>
      )}
      {llmReportingEnabled ? (
        <PaginatedReport reportId={reportId} onPaginated={handlePaginated} />
      ) : (
        <Report reportId={reportId} />
      )}
    </>
  );
};

const PrintReportWrapper = () => {
  const reportBuilderEnabled = useReportBuilderEnabled();
  const { reportId } = useParams({ strict: false });

  if (!reportBuilderEnabled || reportId === undefined) {
    return null;
  }

  return <PrintReport reportId={reportId} />;
};

export default PrintReportWrapper;
