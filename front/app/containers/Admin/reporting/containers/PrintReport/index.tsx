import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// routing
import { useParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// context
import { ReportContext } from '../../context/ReportContext';

// components
import { Text, Spinner, Box } from '@citizenlab/cl2-component-library';
import Report from './Report';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

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

  useEffect(() => {
    if (!_print) return;

    if (isPrintReady) {
      window.print();
    } else {
      setTimeout(() => {
        setIsPrintReady(true);
      }, 5000);
    }
  }, [_print, isPrintReady]);

  useEffect(() => {
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
  }, []);

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
      <ReportContext.Provider value="pdf">
        <Report reportId={reportId} />
      </ReportContext.Provider>
    </>
  );
};

const PrintReportWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { reportId } = useParams();

  if (!reportBuilderEnabled || reportId === undefined) {
    return null;
  }

  return <PrintReport reportId={reportId} />;
};

export default PrintReportWrapper;
