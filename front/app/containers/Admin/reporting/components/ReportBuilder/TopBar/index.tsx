import React, { useState, useEffect } from 'react';

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
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

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
  const [showQuitModal, setShowQuitModal] = useState(false);
  const { query } = useEditor();
  const report = useReport(reportId);

  const disableSave = localesWithError.length > 0;

  const closeModal = () => {
    setShowQuitModal(false);
  };
  const openModal = () => {
    setShowQuitModal(true);
  };
  const goBack = () => {
    if (draftEditorData === undefined) {
      doGoBack();
    } else {
      openModal();
    }
  };
  const doGoBack = () => {
    clHistory.push('/admin/reporting/report-builder');
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

  useEffect(() => {
    if (draftEditorData !== undefined) {
      window.onbeforeunload = () => true;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [draftEditorData]);

  const handleSelectLocale = (locale: Locale) => {
    const editorData = query.getSerializedNodes();
    onSelectLocale({ locale, editorData });
  };

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <Modal opened={showQuitModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              <FormattedMessage {...messages.quitReportConfirmationQuestion} />
            </Title>
            <Text color="primary" fontSize="l">
              <FormattedMessage {...messages.quitReportInfo} />
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={doGoBack}
            >
              <FormattedMessage {...messages.confirmQuitButtonText} />
            </Button>
            <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
              <FormattedMessage {...messages.cancelQuitButtonText} />
            </Button>
          </Box>
        </Box>
      </Modal>
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
