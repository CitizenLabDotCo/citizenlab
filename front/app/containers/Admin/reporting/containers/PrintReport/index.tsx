import React, { useCallback, useEffect, useState } from 'react';

import { Text, Spinner, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../../messages';

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

  // Printing waits for the report to be laid out into pages, not for a fixed
  // number of seconds. The old timer was a race: a slow report printed half-drawn.
  const handlePaginated = useCallback(() => setIsPrintReady(true), []);

  useEffect(() => {
    if (!_print || !isPrintReady) return;

    window.print();
  }, [_print, isPrintReady]);

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
      <Report reportId={reportId} onPaginated={handlePaginated} />
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
