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
import QuitModal from './QuitModal';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import {
  Box,
  IconButton,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import LocaleSelect from './LocaleSelect';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// routing
import clHistory from 'utils/cl-router/history';

// types
import { Locale } from 'typings';
import { View } from '../ViewContainer/typings';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import ViewPicker from '../ViewContainer/ViewPicker';

type ContentBuilderTopBarProps = {
  hasError: boolean;
  hasPendingState: boolean;
  selectedLocale: Locale;
  reportId: string;
  isTemplate: boolean;
  saved: boolean;
  view: View;
  setView: (view: View) => void;
  setSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedLocale: React.Dispatch<React.SetStateAction<Locale>>;
};

const ContentBuilderTopBar = ({
  hasError,
  selectedLocale,
  hasPendingState,
  reportId,
  isTemplate,
  saved,
  view,
  setView,
  setSaved,
  setSelectedLocale,
}: ContentBuilderTopBarProps) => {
  const { formatMessage } = useIntl();

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

          removeSearchParams(['templateProjectId', 'templatePhaseId']);
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

              removeSearchParams(['templateProjectId', 'templatePhaseId']);
            },
          }
        );
      }, 5000);

      setInitialized(true);
    } else {
      setInitialized(true);
    }
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
    <Container id="e2e-report-builder-topbar">
      <QuitModal
        open={showQuitModal}
        onCloseModal={closeModal}
        onGoBack={doGoBack}
      />
      <IconButton
        iconName="arrow-left"
        onClick={goBack}
        buttonType="button"
        iconColor={colors.textSecondary}
        iconColorOnHover={colors.primary}
        iconWidth="20px"
        a11y_buttonActionMessage={formatMessage(messages.goBackButtonMessage)}
        ml="8px"
      />
      <Box display="flex" p="15px" pl="8px" flexGrow={1} alignItems="center">
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
        <Box>
          <LocaleSelect locale={selectedLocale} setLocale={setSelectedLocale} />
        </Box>
        <Box ml="32px">
          {!!phaseId && <ViewPicker view={view} setView={setView} />}
        </Box>
        <Box ml="32px">
          <Button
            icon="print"
            buttonStyle="secondary"
            iconColor={colors.textPrimary}
            iconSize="16px"
            px="12px"
            py="8px"
            linkTo={`/admin/reporting/report-builder/${reportId}/print`}
            openLinkInNewTab
          />
        </Box>
        <SaveButton
          disabled={disableSave}
          processing={isLoading}
          bgColor={saved ? colors.success : undefined}
          icon={saved ? 'check' : undefined}
          onClick={handleSave}
          fontSize="14px"
          ml="8px"
          px="12px"
          pb="3px"
          pt="4px"
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
