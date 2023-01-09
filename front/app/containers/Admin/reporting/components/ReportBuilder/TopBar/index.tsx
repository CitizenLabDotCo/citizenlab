import React, { useState } from 'react';

// services
import { updateReportLayout } from 'services/reports';

// hooks
import { useEditor, SerializedNodes } from '@craftjs/core';
import useReport from 'hooks/useReport';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import QuitWithoutSavingModal from './QuitWithoutSavingModal';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// routing
import clHistory from 'utils/cl-router/history';

// types
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import ShareReportButton from '../../ReportBuilderPage/ReportRow/ShareReportButton';

type ContentBuilderTopBarProps = {
  hasPendingState?: boolean;
  localesWithError: Locale[];
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  draftEditorData?: Record<string, SerializedNodes>;
  reportId: string;
  onSelectLocale: (args: {
    locale: Locale;
    editorData: SerializedNodes;
  }) => void;
};

const ContentBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  onSelectLocale,
  draftEditorData,
  localesWithError,
  hasPendingState,
  reportId,
}: ContentBuilderTopBarProps) => {
  const [loading, setLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const closeShareModal = () => setShareModalOpen(false);
  const { query } = useEditor();
  const report = useReport(reportId);

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
    if (draftEditorData === undefined) {
      clHistory.push('/admin/reporting/report-builder');
    } else {
      setShareModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (selectedLocale) {
      try {
        setLoading(true);
        await updateReportLayout(reportId, {
          ...draftEditorData,
          [selectedLocale]: query.getSerializedNodes(),
        });
      } catch {
        // Do nothing
      }
      setLoading(false);
    }
  };

  const handleSelectLocale = (locale: Locale) => {
    const editorData = query.getSerializedNodes();
    onSelectLocale({ locale, editorData });
  };

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <QuitWithoutSavingModal
        open={shareModalOpen}
        onClose={closeShareModal}
        setShareModalOpen={setShareModalOpen}
      />
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="textSecondary">
            <FormattedMessage {...messages.reportBuilder} />
          </Text>
          <Title variant="h4" as="h1" color="primary">
            {isNilOrError(report) ? <></> : report.attributes.name}
          </Title>
        </Box>
        <LocaleSwitcher
          selectedLocale={selectedLocale}
          localesWithError={localesWithError}
          onSelectLocale={handleSelectLocale}
        />
        <Box mx="24px">
          <PreviewToggle
            checked={previewEnabled}
            onChange={handleTogglePreview}
          />
        </Box>
        <Box mr="20px">
          <ShareReportButton reportId={reportId} />
        </Box>
        <SaveButton
          disabled={!!(disableSave || hasPendingState)}
          processing={loading}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
