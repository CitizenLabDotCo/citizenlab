import React, { useEffect, useRef, useState } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useReportLayout from 'api/report_layout/useReportLayout';
import useReport from 'api/reports/useReport';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import Editor from '../../components/ReportBuilder/Editor';
import { ReportContextProvider } from '../../context/ReportContext';

import { paginateReport, PaginationResult } from './paginate';
import useReportSettled from './useReportSettled';

// The report is built here at the page's content width and then laid out into
// page boxes. Paged.js copies what it finds rather than moving it, so once the
// pages exist the source is taken out of the document entirely — left in place
// it would print a second, unpaginated copy of the whole report after the pages.
const Source = styled.div<{ $paginated: boolean }>`
  width: 182mm;
  margin: 0 auto;
  ${({ $paginated }) => ($paginated ? 'display: none;' : '')}
`;

// Layout only, deliberately no background. Paged.js rebuilds the whole ancestor
// chain of the report inside every page box so that inherited styles still apply,
// which means a background on any ancestor of the source is painted inside each
// sheet. The desk below is a sibling of the source for exactly that reason.
const Stage = styled.div`
  min-height: 100vh;
`;

// On screen the pages read as a stack of sheets on a desk; on paper they are
// simply the pages. None of the desk may reach the printer: paged.js turns on
// print-color-adjust, so a background meant for the screen is printed rather
// than dropped the way Chrome normally drops one.
const Pages = styled.div`
  background: #f6f7f8;
  padding: 12mm 0;
  min-height: 100vh;

  .pagedjs_page {
    margin: 0 auto 12mm;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  }

  @media print {
    background: none;
    padding: 0;
    min-height: 0;

    .pagedjs_page {
      margin: 0;
      box-shadow: none;
    }

    /* Paged.js ends every page with a forced break, the last one included, and
       a break after the final page is a blank sheet. Only the breaks between
       pages are wanted. */
    .pagedjs_page:last-of-type,
    .pagedjs_page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
  }
`;

export interface Props {
  reportId: string;
  onPaginated?: (result: PaginationResult) => void;
}

export const Report = ({ reportId, onPaginated }: Props) => {
  const { data: report } = useReport(reportId);
  const { data: reportLayout } = useReportLayout(reportId);
  const settled = useReportSettled();

  const sourceRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [paginated, setPaginated] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!settled || started.current) return;
    const source = sourceRef.current;
    const pages = pagesRef.current;
    if (!source || !pages) return;

    started.current = true;
    paginateReport(source, pages)
      .then((result) => {
        setPaginated(true);
        onPaginated?.(result);
      })
      .catch(() => {
        // Leave the un-paginated report on screen: a readable single column
        // beats an empty page.
        setPaginated(false);
      });
  }, [settled, onPaginated]);

  if (!report || !reportLayout) return <Spinner />;

  const phaseId = report.data.relationships.phase?.data?.id;

  return (
    <ReportContextProvider width="pdf" reportId={reportId} phaseId={phaseId}>
      <Stage>
        <Source ref={sourceRef} $paginated={paginated}>
          <Editor isPreview>
            <ContentBuilderFrame
              editorData={reportLayout.data.attributes.craftjs_json}
            />
          </Editor>
        </Source>
        <Pages ref={pagesRef} className="e2e-report-pages" />
      </Stage>
    </ReportContextProvider>
  );
};

export default Report;
