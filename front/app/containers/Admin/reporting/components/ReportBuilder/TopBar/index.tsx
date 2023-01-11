import React, { useState, useEffect } from 'react';

// services
import { updateReportLayout } from 'services/reports';

// hooks
import { useEditor, SerializedNodes } from '@craftjs/core';
import useReport from 'hooks/useReport';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import ShareReportButton from '../../ReportBuilderPage/ReportRow/ShareReportButton';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { fontSizes, colors, stylingConsts } from 'utils/styleUtils';
import styled from 'styled-components';

// routing
import clHistory from 'utils/cl-router/history';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { Locale } from 'typings';

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
  hasPendingState?: boolean;
  localesWithError: Locale[];
  previewEnabled: boolean;
  setPreviewEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLocale: Locale | undefined;
  draftEditorData?: Record<string, SerializedNodes>;
  reportId: string;
  projectId?: string;
};

const ContentBuilderTopBar = ({
  previewEnabled,
  setPreviewEnabled,
  selectedLocale,
  draftEditorData,
  localesWithError,
  hasPendingState,
  reportId,
  projectId,
}: ContentBuilderTopBarProps) => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { query } = useEditor();
  const report = useReport(reportId);

  const disableSave = localesWithError.length > 0;

  const goBack = () => {
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
    if (initialized) return;

    if (!projectId) {
      setInitialized(true);
      return;
    }

    const nodes = query.getSerializedNodes();
    const firstNode = nodes.ROOT?.nodes[0];
    const numberOfNodes = Object.keys(nodes).length;

    if (!firstNode || !selectedLocale || numberOfNodes < 5) return;

    if (nodes?.[firstNode].displayName === 'ProjectTemplate') {
      setTimeout(() => {
        updateReportLayout(reportId, {
          ...draftEditorData,
          [selectedLocale]: query.getSerializedNodes(),
        });
      }, 5000);
    }

    setInitialized(true);
  }, [
    projectId,
    query,
    draftEditorData,
    initialized,
    reportId,
    selectedLocale,
  ]);

  const handleTogglePreview = () => {
    setPreviewEnabled((previewEnabled) => !previewEnabled);
  };

  return (
    <Container>
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <Text mb="0px" color="textSecondary">
            <FormattedMessage {...messages.reportBuilder} />
          </Text>
          <Title variant="h4" as="h1" color="primary">
            {isNilOrError(report) ? <></> : report.attributes.name}
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
          processing={loading}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
