import React, { useState, useEffect } from 'react';

// hooks
import { useEditor } from '@craftjs/core';
import useUpdateReportLayout from 'api/report_layout/useUpdateReportLayout';
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

// context
import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

// components
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import PreviewToggle from 'components/admin/ContentBuilder/TopBar/PreviewToggle';
import LocaleSwitcher from 'components/admin/ContentBuilder/TopBar/LocaleSwitcher';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';
import ShareReportButton from '../../ReportBuilderPage/ReportRow/Buttons/ShareReportButton';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// routing
import clHistory from 'utils/cl-router/history';

// types
import { Locale } from 'typings';

type ContentBuilderTopBarProps = {
  hasError: boolean;
  hasPendingState: boolean;
  selectedLocale: Locale;
  reportId: string;
  templateProjectId?: string;
  saved: boolean;
  previewEnabled: boolean;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewEnabled: () => void;
  setSelectedLocale: React.Dispatch<React.SetStateAction<Locale>>;
};

const ContentBuilderTopBar = ({
  hasError,
  selectedLocale,
  hasPendingState,
  reportId,
  templateProjectId,
  saved,
  previewEnabled,
  setSaved,
  setPreviewEnabled,
  setSelectedLocale,
}: ContentBuilderTopBarProps) => {
  const [initialized, setInitialized] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const { query } = useEditor();
  const { mutate: updateReportLayout, isLoading } = useUpdateReportLayout();
  const { projectId, phaseId } = useReportContext();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const localize = useLocalize();

  const disableSave = !!hasError || !!hasPendingState || saved;

  const closeModal = () => {
    setShowQuitModal(false);
  };
  const openModal = () => {
    setShowQuitModal(true);
  };
  const goBack = () => {
    if (!saved) {
      openModal();
    } else {
      doGoBack();
    }
  };
  const doGoBack = () => {
    const goBackUrl =
      projectId && phaseId
        ? `/admin/projects/${projectId}/phases/${phaseId}/setup`
        : '/admin/reporting/report-builder';

    clHistory.push(goBackUrl);
  };

  const handleSave = () => {
    updateReportLayout(
      {
        id: reportId,
        craftjs_json: query.getSerializedNodes(),
        projectId,
      },
      {
        onSuccess: () => {
          setSaved(true);
        },
      }
    );
  };

  useEffect(() => {
    if (!saved) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [saved]);

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
        updateReportLayout(
          {
            id: reportId,
            craftjs_json: query.getSerializedNodes(),
            projectId,
          },
          {
            onSuccess: () => {
              setSaved(true);
            },
          }
        );
      }, 5000);
    }

    setInitialized(true);
  }, [
    templateProjectId,
    query,
    initialized,
    reportId,
    updateReportLayout,
    projectId,
    setSaved,
  ]);

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
          <Title variant="h3" as="h1" mb="0px" mt="0px">
            <FormattedMessage {...messages.reportBuilder} />
          </Title>
          {project && phase && (
            <Text m="0" color="textSecondary">
              {localize(project.data.attributes.title_multiloc)}{' '}
              <span style={{ color: colors.black, fontWeight: '700' }}>
                ({localize(phase.data.attributes.title_multiloc)})
              </span>
            </Text>
          )}
        </Box>
        <LocaleSwitcher
          selectedLocale={selectedLocale}
          onSelectLocale={setSelectedLocale}
        />
        <Box mx="24px">
          <PreviewToggle
            checked={previewEnabled}
            onChange={setPreviewEnabled}
          />
        </Box>
        <Box mr="20px">
          <ShareReportButton reportId={reportId} />
        </Box>
        <SaveButton
          disabled={disableSave}
          processing={isLoading}
          bgColor={saved ? colors.success : undefined}
          icon={saved ? 'check' : undefined}
          onClick={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
