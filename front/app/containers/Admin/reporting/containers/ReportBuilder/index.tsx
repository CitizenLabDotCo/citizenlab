import React, { useState } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Locale } from 'typings';

import { ReportLayout } from 'api/report_layout/types';
import useReportLayout from 'api/report_layout/useReportLayout';
import { ReportResponse } from 'api/reports/types';
import useReport from 'api/reports/useReport';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import Frame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import Editor from '../../components/ReportBuilder/Editor';
import Settings from '../../components/ReportBuilder/Settings';
import PhaseTemplate from '../../components/ReportBuilder/Templates/PhaseTemplate';
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import TopBar from '../../components/ReportBuilder/TopBar';
import ViewContainer from '../../components/ReportBuilder/ViewContainer';
import { View } from '../../components/ReportBuilder/ViewContainer/typings';
import { A4_WIDTH } from '../../constants';
import { ReportContextProvider } from '../../context/ReportContext';
import messages from '../../messages';
import areCraftjsObjectsEqual from '../../utils/areCraftjsObjectsEqual';

interface Props {
  report: ReportResponse;
  reportLayout: ReportLayout;
}

const ReportBuilder = ({ report, reportLayout }: Props) => {
  const reportId = report.data.id;
  const phaseId = report.data.relationships.phase?.data?.id;

  const platformLocale = useLocale();
  const [search] = useSearchParams();
  const templateProjectId = search.get('templateProjectId');
  const templatePhaseId = search.get('templatePhaseId');
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
  const [selectedLocale, setSelectedLocale] = useState<Locale>(platformLocale);

  const [saved, setSaved] = useState(true);
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

  const handleSetSaved = () => {
    setSaved(true);
  };

  return (
    <ReportContextProvider width="pdf" reportId={reportId} phaseId={phaseId}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor
          isPreview={false}
          // onNodesChange is called twice on initial load.
          onNodesChange={(query) => {
            // This comparison is still not perfect.
            // E.g., if you add a node with rich text editor, save the report,
            // and then modify the default text and revert the change,
            // areCraftjsObjectsEqual may still return false, because the default text may not have
            // a wrapping <p> tag, which is added as soon as you start typing.
            // But it's good enough for now.
            setSaved(
              areCraftjsObjectsEqual(
                query.getSerializedNodes(),
                reportLayout.attributes.craftjs_json
              )
            );
          }}
        >
          <TopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            selectedLocale={selectedLocale}
            reportId={reportId}
            isTemplate={!!templateProjectId || !!templatePhaseId}
            saved={saved}
            view={view}
            setView={setView}
            setSaved={handleSetSaved}
            setSelectedLocale={setSelectedLocale}
          />
          <Box mt={`${stylingConsts.menuHeight}px`}>
            <Toolbox reportId={reportId} />
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
                    {emptyReportOnInit && templateProjectId ? (
                      <ProjectTemplate
                        reportId={reportId}
                        projectId={templateProjectId}
                      />
                    ) : emptyReportOnInit && templatePhaseId ? (
                      <PhaseTemplate phaseId={templatePhaseId} />
                    ) : null}
                  </Frame>
                </ViewContainer>
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
