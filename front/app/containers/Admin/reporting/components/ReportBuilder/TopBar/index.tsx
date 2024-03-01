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
import PrintReportButton from '../../ReportBuilderPage/ReportRow/Buttons/PrintReportButton';

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
  isTemplate: boolean;
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
  isTemplate,
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
        ? `/admin/projects/${projectId}/phases/${phaseId}/report`
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

  // This useEffect handles autosave for templates
  useEffect(() => {
    if (initialized) return;

    if (!isTemplate) {
      setInitialized(true);
      return;
    }

    const nodes = query.getSerializedNodes();
    const firstNode = nodes.ROOT?.nodes[0];

    if (!firstNode) return;

    const displayName = nodes?.[firstNode].displayName;

    if (['ProjectTemplate', 'PhaseTemplate'].includes(displayName)) {
      const numberOfNodes = Object.keys(nodes).length;

      if (displayName === 'ProjectTemplate' && numberOfNodes < 5) return;

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
    isTemplate,
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
              buttonStyle="secondary"
              width="auto"
              mr="16px"
              onClick={closeModal}
            >
              <FormattedMessage {...messages.cancelQuitButtonText} />
            </Button>
            <Button
              icon="delete"
              data-cy="e2e-confirm-delete-survey-results"
              buttonStyle="delete"
              width="auto"
              onClick={doGoBack}
            >
              <FormattedMessage {...messages.confirmQuitButtonText} />
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
          <PrintReportButton reportId={reportId} />
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
