import React, { useState, useEffect } from 'react';

// hooks
import { useEditor } from '@craftjs/core';
import useReport from 'api/reports/useReport';
import useUpdateReportLayout from 'api/report_layout/useUpdateReportLayout';

// context
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';
import ShareReportButton from '../../ReportBuilderPage/ReportRow/Buttons/ShareReportButton';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { fontSizes, colors, stylingConsts } from 'utils/styleUtils';
import styled from 'styled-components';

// routing
import clHistory from 'utils/cl-router/history';

// utils
import { isEqual } from 'lodash-es';

// types
import { Locale } from 'typings';
import { CraftJson } from 'components/admin/ContentBuilder/typings';

const LocaleBadge = styled(Box)`
  display: inline-block;
  color: ${colors.textSecondary};
  background-color: ${colors.grey200};
  font-weight: bold;
  font-size: ${fontSizes.xs}px;
  padding: 0px 6px;
  margin-left: 15px;
  border-radius: ${stylingConsts.borderRadius};
`;

type ContentBuilderTopBarProps = {
  hasError: boolean;
  hasPendingState: boolean;
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  draftEditorData?: CraftJson;
  initialData: CraftJson;
  reportId: string;
  templateProjectId?: string;
};

const ContentBuilderTopBar = ({
  hasError,
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  draftEditorData,
  initialData,
  hasPendingState,
  reportId,
  templateProjectId,
}: ContentBuilderTopBarProps) => {
  const [initialized, setInitialized] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [hasChange, setHasChange] = useState(false);
  const { query } = useEditor();
  const { data: report } = useReport(reportId);
  const { mutate: updateReportLayout, isLoading } = useUpdateReportLayout();
  const reportContext = useReportContext();

  const disableSave = !!hasError || !!hasPendingState;

  const closeModal = () => {
    setShowQuitModal(false);
  };
  const openModal = () => {
    setShowQuitModal(true);
  };
  const goBack = () => {
    if (hasChange) {
      openModal();
    } else {
      doGoBack();
    }
  };
  const doGoBack = () => {
    const { projectId, phaseId } = reportContext;

    const goBackUrl =
      projectId && phaseId
        ? `/admin/projects/${projectId}/timeline/${phaseId}`
        : '/admin/reporting/report-builder';

    clHistory.push(goBackUrl);
  };

  const handleSave = () => {
    if (selectedLocale) {
      setHasChange(false);

      updateReportLayout({
        id: reportId,
        craftjs_json: query.getSerializedNodes(),
        projectId: reportContext.projectId,
      });
    }
  };

  useEffect(() => {
    if (!selectedLocale || !draftEditorData) return;
    setHasChange(
      !isEqual(
        JSON.parse(JSON.stringify(initialData ?? {})),
        JSON.parse(JSON.stringify(draftEditorData[selectedLocale] ?? {}))
      )
    );
  }, [initialData, draftEditorData, selectedLocale]);

  useEffect(() => {
    if (hasChange) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [hasChange]);

  useEffect(() => {
    if (initialized) return;

    if (!templateProjectId) {
      setInitialized(true);
      return;
    }

    const nodes = query.getSerializedNodes();
    const firstNode = nodes.ROOT?.nodes[0];
    const numberOfNodes = Object.keys(nodes).length;

    if (!firstNode || numberOfNodes < 5) return;

    if (nodes?.[firstNode].displayName === 'ProjectTemplate') {
      setTimeout(() => {
        updateReportLayout({
          id: reportId,
          craftjs_json: query.getSerializedNodes(),
          projectId: reportContext.projectId,
        });
      }, 5000);
    }

    setInitialized(true);
  }, [
    templateProjectId,
    query,
    draftEditorData,
    initialized,
    reportId,
    updateReportLayout,
    reportContext.projectId,
  ]);

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
            {!report ? <></> : report.data.attributes.name}
            <LocaleBadge>{selectedLocale?.toUpperCase()}</LocaleBadge>
          </Title>
        </Box>
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
          processing={isLoading}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
