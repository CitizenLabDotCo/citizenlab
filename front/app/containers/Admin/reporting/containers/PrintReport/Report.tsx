import React from 'react';
import styled from 'styled-components';

// context
import { ReportContextProvider } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Spinner, Box } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// constants
import { A4_WIDTH } from '../../constants';

const Centerer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media print {
    margin-top: -20px;
    display: block;
    position: absolute;
    @page {
      size: auto;
      margin: 30px 0;
    }
  }
`;

export interface Props {
  reportId: string;
}

export const Report = ({ reportId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const isLoadingLayout = reportLayout === undefined;

  return (
    <ReportContextProvider width="pdf" reportId={reportId}>
      <FullScreenWrapper>
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && (
          <Centerer>
            <Box
              width={A4_WIDTH}
              pl="5mm"
              pr="10mm"
              position="absolute"
              background="white"
            >
              <Box>
                <Editor isPreview={true}>
                  <ContentBuilderFrame
                    editorData={reportLayout.data.attributes.craftjs_json}
                  />
                </Editor>
              </Box>
            </Box>
          </Centerer>
        )}
      </FullScreenWrapper>
    </ReportContextProvider>
  );
};

export default Report;
