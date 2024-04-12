import React, { useState, useEffect } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

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
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Editor from '../../components/ReportBuilder/Editor';
import Settings from '../../components/ReportBuilder/Settings';
import { TemplateContext } from '../../components/ReportBuilder/Templates/context';
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
  templateProjectId: string | null;
  templatePhaseId: string | null;
}

const ReportBuilder = ({
  report,
  reportLayout,
  templateProjectId,
  templatePhaseId,
}: Props) => {
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

  const handleSetSaved = () => {
    setSaved(true);
  };

  return (
    <ReportContextProvider width={view} reportId={reportId} phaseId={phaseId}>
      <FullscreenContentBuilder onUploadImage={setImageUploading}>
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
            // Also, see reactions_by_time_widget.cy.ts#getReportLayout
            // for the current pitfalls of the `saved` state.
            //
            // Ideally, we should detected this `saved` state in only one way.
            // Either always via areCraftjsObjectsEqual (probably,
            // storing `currentNodes` state instead or `saved` state)
            // or always via setSaved(true) (and then without detecting
            // when nodes were changed and then changed back w/o saving).
            // Also, we could move the states from ContentBuilderTopBar
            // here to manage the entire state in one place and get rid of
            // `setInterval`.
            setSaved(
              areCraftjsObjectsEqual(
                query.getSerializedNodes(),
                reportLayout.attributes.craftjs_json
              )
            );
          }}
        >
          <TopBar
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
            <Toolbox reportId={reportId} selectedLocale={selectedLocale} />
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

  const [search] = useSearchParams();
  const [templateProjectId] = useState(search.get('templateProjectId'));
  const [templatePhaseId] = useState(search.get('templatePhaseId'));

  useEffect(() => {
    removeSearchParams(['templateProjectId', 'templatePhaseId']);
  }, []);

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined &&
    report &&
    reportLayout;

  if (!renderReportBuilder) return null;

  return (
    <TemplateContext.Provider value={!!(templateProjectId || templatePhaseId)}>
      <ReportBuilder
        report={report}
        reportLayout={reportLayout.data}
        templateProjectId={templateProjectId}
        templatePhaseId={templatePhaseId}
      />
    </TemplateContext.Provider>
  );
};

export default ReportBuilderWrapper;
