import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import { ReportLayout } from 'api/report_layout/types';
import useReportLayout from 'api/report_layout/useReportLayout';
import { ReportResponse } from 'api/reports/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import useLocale from 'hooks/useLocale';

import Frame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Editor from '../../components/ReportBuilder/Editor';
import Settings from '../../components/ReportBuilder/Settings';
import CommunityMonitorTemplate from '../../components/ReportBuilder/Templates/CommunityMonitorTemplate';
import { TemplateContext } from '../../components/ReportBuilder/Templates/context';
import PhaseTemplate from '../../components/ReportBuilder/Templates/PhaseTemplate';
import PlatformTemplate from '../../components/ReportBuilder/Templates/PlatformTemplate';
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import TopBar from '../../components/ReportBuilder/TopBar';
import ViewContainer from '../../components/ReportBuilder/ViewContainer';
import { View } from '../../components/ReportBuilder/ViewContainer/typings';
import { A4_WIDTH } from '../../constants';
import { ReportContextProvider } from '../../context/ReportContext';
import messages from '../../messages';
import areCraftjsObjectsEqual from '../../utils/areCraftjsObjectsEqual';
import { ReportWordExportProvider } from '../../word/ReportWordExportContext';

import { getTemplateConfig, TemplateConfig } from './utils';

interface Props {
  report: ReportResponse;
  reportLayout: ReportLayout;
  templateConfig?: TemplateConfig;
}

const ReportBuilder = ({ report, reportLayout, templateConfig }: Props) => {
  const reportId = report.data.id;
  const phaseId = report.data.relationships.phase?.data?.id;

  const platformLocale = useLocale();
  const [view, setView] = useState<View>('pdf');

  const [initialData] = useState(() => {
    const { craftjs_json } = reportLayout.attributes;

    if (isEmpty(craftjs_json)) {
      return undefined;
    }

    return craftjs_json;
  });

  const emptyReportOnInit = initialData === undefined;

  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] =
    useState<SupportedLocale>(platformLocale);

  const [saved, setSaved] = useState(true);

  // Use ref to track last saved nodes to avoid stale closure issues
  const lastSavedNodesRef = useRef<SerializedNodes>(
    reportLayout.attributes.craftjs_json
  );

  const handleSetSaved = useCallback((savedNodes: SerializedNodes) => {
    lastSavedNodesRef.current = savedNodes;
    setSaved(true);
  }, []);

  const handleNodesChange = useCallback((query) => {
    const currentNodes = query.getSerializedNodes();
    const isSaved = areCraftjsObjectsEqual(
      currentNodes,
      lastSavedNodesRef.current
    );
    // Use setTimeout to defer state update outside render cycle
    setTimeout(() => setSaved(isSaved), 0);
  }, []);

  return (
    <ReportContextProvider
      width={view}
      reportId={reportId}
      phaseId={phaseId}
      contentBuilderLocale={selectedLocale}
    >
      <FullscreenContentBuilder onUploadImage={setImageUploading}>
        <Editor
          isPreview={false}
          // onNodesChange is called twice on initial load.
          onNodesChange={handleNodesChange}
        >
          <ReportWordExportProvider>
            <TopBar
              hasPendingState={imageUploading}
              selectedLocale={selectedLocale}
              reportId={reportId}
              isTemplate={!!templateConfig}
              saved={saved}
              view={view}
              setView={setView}
              setSaved={handleSetSaved}
              setSelectedLocale={setSelectedLocale}
            />
            <Box mt={`${stylingConsts.menuHeight}px`}>
              <Toolbox selectedLocale={selectedLocale} />
              <LanguageProvider
                contentBuilderLocale={selectedLocale}
                platformLocale={platformLocale}
              >
                <StyledRightColumn>
                  {!!phaseId && (
                    <Box maxWidth={A4_WIDTH} mb="20px">
                      <Warning>
                        <FormattedMessage {...messages.warningBanner} />
                      </Warning>
                    </Box>
                  )}
                  <ViewContainer view={view}>
                    <Frame editorData={initialData}>
                      {emptyReportOnInit &&
                      templateConfig?.template === 'project' ? (
                        <ProjectTemplate
                          reportId={reportId}
                          projectId={templateConfig.projectId}
                        />
                      ) : emptyReportOnInit &&
                        templateConfig?.template === 'phase' ? (
                        <PhaseTemplate
                          phaseId={templateConfig.phaseId}
                          selectedLocale={selectedLocale}
                        />
                      ) : emptyReportOnInit &&
                        templateConfig?.template === 'platform' ? (
                        <PlatformTemplate
                          startDate={templateConfig.startDate}
                          endDate={templateConfig.endDate}
                        />
                      ) : emptyReportOnInit &&
                        templateConfig?.template === 'community-monitor' ? (
                        <CommunityMonitorTemplate
                          quarter={templateConfig.quarter}
                          year={templateConfig.year}
                        />
                      ) : null}
                    </Frame>
                  </ViewContainer>
                </StyledRightColumn>
              </LanguageProvider>
              <Settings />
            </Box>
          </ReportWordExportProvider>
        </Editor>
      </FullscreenContentBuilder>
    </ReportContextProvider>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useReportBuilderEnabled();
  const { pathname } = useLocation();
  const { reportId } = useParams();
  const { data: report } = useReport(reportId);
  const { data: reportLayout } = useReportLayout(reportId);

  const [search] = useSearchParams();
  const [templateProjectId] = useState(search.get('templateProjectId'));
  const [templatePhaseId] = useState(search.get('templatePhaseId'));
  const [startDatePlatformReport] = useState(
    search.get('startDatePlatformReport')
  );

  const [endDatePlatformReport] = useState(search.get('endDatePlatformReport'));

  const [templateYear] = useState(
    report?.data.attributes.year?.toString() || search.get('year')
  );
  const [templateQuarter] = useState(
    report?.data.attributes.quarter?.toString() || search.get('quarter')
  );

  useEffect(() => {
    removeSearchParams([
      'templateProjectId',
      'templatePhaseId',
      'startDatePlatformReport',
      'endDatePlatformReport',
      'year',
      'quarter',
    ]);
  }, []);

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined &&
    report &&
    reportLayout;

  if (!renderReportBuilder) return null;

  const templateConfig = getTemplateConfig({
    templateProjectId,
    templatePhaseId,
    templateYear,
    templateQuarter,
    startDatePlatformReport,
    endDatePlatformReport,
  });

  return (
    <TemplateContext.Provider value={!!templateConfig}>
      <ReportBuilder
        report={report}
        reportLayout={reportLayout.data}
        templateConfig={templateConfig}
      />
    </TemplateContext.Provider>
  );
};

export default ReportBuilderWrapper;
