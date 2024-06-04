import React, { useState, useEffect } from 'react';

import {
  Box,
  Text,
  Title,
  colors,
  IconButton,
  TooltipContentWrapper,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import Tippy from '@tippyjs/react';
import { RouteType } from 'routes';
import { SupportedLocale } from 'typings';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useUpdateReportLayout from 'api/report_layout/useUpdateReportLayout';

import useLocalize from 'hooks/useLocalize';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import { CONTENT_BUILDER_Z_INDEX } from 'components/admin/ContentBuilder/constants';
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/Button';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { PLATFORM_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE } from '../Templates/PlatformTemplate/constants';
import { PROJECT_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE } from '../Templates/ProjectTemplate/constants';
import { View } from '../ViewContainer/typings';
import ViewPicker from '../ViewContainer/ViewPicker';

import LocaleSelect from './LocaleSelect';
import messages from './messages';
import QuitModal from './QuitModal';

type ContentBuilderTopBarProps = {
  hasPendingState: boolean;
  selectedLocale: SupportedLocale;
  reportId: string;
  isTemplate: boolean;
  saved: boolean;
  view: View;
  setView: (view: View) => void;
  setSaved: () => void;
  setSelectedLocale: React.Dispatch<React.SetStateAction<SupportedLocale>>;
};

// TODO remove
const error = console.error.bind(console);

console.error = (...args: any[]) => {
  if (args[0].code === 'MISSING_TRANSLATION') return;
  error(...args);
};

const ContentBuilderTopBar = ({
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
  const [initialized, setInitialized] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const { query } = useEditor();
  const { mutate: updateReportLayout, isLoading } = useUpdateReportLayout();
  const { projectId, phaseId } = useReportContext();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const disableSave = !!hasPendingState || saved;
  const disablePrint = !!hasPendingState || !saved;

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
    const goBackUrl: RouteType =
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
          setSaved();
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

    const interval = setInterval(() => {
      const nodes = query.getSerializedNodes();
      const firstNode = nodes.ROOT?.nodes[0];
      if (!firstNode) return;

      const displayName = nodes?.[firstNode].displayName;

      if (
        !['ProjectTemplate', 'PhaseTemplate', 'PlatformTemplate'].includes(
          displayName
        )
      ) {
        // In theory this should not be possible, but handling
        // it gracefully just in case
        setInitialized(true);
        clearInterval(interval);
        return;
      }

      // Nodes take some time to load. We don't want to save if not
      // all nodes are loaded yet. That's why we add these checks-
      // if we early return here, we basically wait for the next interval and check
      // again if the number of nodes is already correct.
      const numberOfNodes = Object.keys(nodes).length;

      if (
        displayName === 'ProjectTemplate' &&
        numberOfNodes < PROJECT_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE
      ) {
        return;
      }
      if (
        displayName === 'PlatformTemplate' &&
        numberOfNodes < PLATFORM_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE
      ) {
        return;
      }

      updateReportLayout(
        {
          id: reportId,
          craftjs_json: nodes,
          projectId,
        },
        {
          onSuccess: () => {
            setSaved();
          },
        }
      );

      setInitialized(true);
      clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
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
        {!!phaseId && (
          <Box ml="32px">
            <ViewPicker view={view} setView={setView} />
          </Box>
        )}
        <Box ml="32px">
          <Tippy
            interactive={false}
            placement="bottom"
            disabled={!disablePrint}
            zIndex={CONTENT_BUILDER_Z_INDEX.tooltip}
            content={
              <TooltipContentWrapper tippytheme="light">
                {formatMessage(messages.cannotPrint)}
              </TooltipContentWrapper>
            }
          >
            <div>
              <Button
                icon="print"
                buttonStyle="secondary"
                iconColor={colors.textPrimary}
                iconSize="16px"
                px="12px"
                py="8px"
                linkTo={`/admin/reporting/report-builder/${reportId}/print`}
                openLinkInNewTab
                disabled={disablePrint}
              />
            </div>
          </Tippy>
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
