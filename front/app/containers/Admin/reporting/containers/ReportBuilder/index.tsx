import React, { useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useReport from 'api/reports/useReport';
import useReportLayout from 'api/report_layout/useReportLayout';
import useLocale from 'hooks/useLocale';

// context
import { ReportContextProvider } from '../../context/ReportContext';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

// components
import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../../components/ReportBuilder/Editor';
import TopBar from '../../components/ReportBuilder/TopBar';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import Frame from 'components/admin/ContentBuilder/Frame';
import Settings from '../../components/ReportBuilder/Settings';
import PDFWrapper from '../../components/ReportBuilder/EditModePreview/PDFWrapper';

// templates
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';
import PhaseTemplate from '../../components/ReportBuilder/Templates/PhaseTemplate';

// typings
import {
  CraftJson,
  ContentBuilderErrors,
} from 'components/admin/ContentBuilder/typings';
import { SerializedNode } from '@craftjs/core';
import { Locale } from 'typings';
import { ReportLayout } from 'api/report_layout/types';
import { isEmpty } from 'lodash-es';
import { ReportResponse } from 'api/reports/types';

interface Props {
  report: ReportResponse;
  reportLayout: ReportLayout;
}

const ROOT_NODE: SerializedNode = {
  type: 'div',
  isCanvas: true,
  props: {
    id: 'e2e-content-builder-frame',
  },
  displayName: 'div',
  custom: {},
  hidden: false,
  nodes: [],
  linkedNodes: {},
  parent: undefined as unknown as string, // Bug in CraftJS types
};

const INITIAL_NODES: CraftJson = {
  ROOT: ROOT_NODE,
};

const ReportBuilder = ({ report, reportLayout }: Props) => {
  const reportId = report.data.id;
  const phaseId = report.data.relationships.phase?.data?.id;

  const platformLocale = useLocale();
  const [search] = useSearchParams();
  const templateProjectId = search.get('templateProjectId');
  const templatePhaseId = search.get('templatePhaseId');

  const { craftjs_json } = reportLayout.attributes;
  const isEmptyReport = isEmpty(craftjs_json);

  const [initialData] = useState(() => {
    if (isEmptyReport) {
      if (templateProjectId || templatePhaseId) {
        return undefined;
      } else {
        return INITIAL_NODES;
      }
    }

    return craftjs_json;
  });

  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(platformLocale);

  const [saved, setSaved] = useState(!templateProjectId);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const handleErrors = (newErrors: ContentBuilderErrors) => {
    setContentBuilderErrors((contentBuilderErrors) => ({
      ...contentBuilderErrors,
      ...newErrors,
    }));
  };

  const handleDeleteElement = (id: string) => {
    setContentBuilderErrors((contentBuilderErrors) => {
      const { [id]: _id, ...rest } = contentBuilderErrors;
      return rest;
    });
  };

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  return (
    <ReportContextProvider width="pdf" reportId={reportId} phaseId={phaseId}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor isPreview={false} onNodesChange={() => setSaved(false)}>
          <TopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            selectedLocale={selectedLocale}
            reportId={reportId}
            isTemplate={!!templateProjectId || !!templatePhaseId}
            saved={saved}
            setSaved={setSaved}
            setSelectedLocale={setSelectedLocale}
          />
          <Box mt={`${stylingConsts.menuHeight}px`}>
            <Toolbox reportId={reportId} />
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={platformLocale}
            >
              <StyledRightColumn>
                <PDFWrapper>
                  <Frame editorData={initialData}>
                    {isEmptyReport && templateProjectId ? (
                      <ProjectTemplate
                        reportId={reportId}
                        projectId={templateProjectId}
                      />
                    ) : isEmptyReport && templatePhaseId ? (
                      <PhaseTemplate phaseId={templatePhaseId} />
                    ) : null}
                  </Frame>
                </PDFWrapper>
              </StyledRightColumn>
            </LanguageProvider>
            <Settings />
          </Box>
        </Editor>
      </FullscreenContentBuilder>
    </ReportContextProvider>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { pathname } = useLocation();
  const { reportId } = useParams();
  const { data: report } = useReport(reportId);
  const { data: reportLayout } = useReportLayout(reportId);

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined &&
    report &&
    reportLayout;

  if (!renderReportBuilder) return null;

  return <ReportBuilder report={report} reportLayout={reportLayout.data} />;
};

export default ReportBuilderWrapper;
