import React, { useState, useEffect } from 'react';

import {
  Box,
  Text,
  colors,
  TooltipContentWrapper,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import { RouteType } from 'routes';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useUpdateReportLayout from 'api/report_layout/useUpdateReportLayout';

import useLocalize from 'hooks/useLocalize';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import { CONTENT_BUILDER_Z_INDEX } from 'components/admin/ContentBuilder/constants';
import Container from 'components/admin/ContentBuilder/TopBar/Container';
import GoBackButton from 'components/admin/ContentBuilder/TopBar/GoBackButton';
import LocaleSelect from 'components/admin/ContentBuilder/TopBar/LocaleSelect';
import SaveButton from 'components/admin/ContentBuilder/TopBar/SaveButton';
import Button from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isCommunityMonitorProject } from 'utils/projectUtils';

import { PLATFORM_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE } from '../Templates/PlatformTemplate/constants';
import { PROJECT_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE } from '../Templates/ProjectTemplate/constants';
import { View } from '../ViewContainer/typings';
import ViewPicker from '../ViewContainer/ViewPicker';

import messages from './messages';
import QuitModal from './QuitModal';
import ReportTitle from './ReportTitle';
import tracks from './tracks';

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

const TEMPLATE_NODES = new Set([
  'ProjectTemplate',
  'PhaseTemplate',
  'PlatformTemplate',
]);

const isTemplateNode = (resolvedName?: string) => {
  if (!resolvedName) return false;
  return TEMPLATE_NODES.has(resolvedName);
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
  const { data: appConfig } = useAppConfiguration();
  const [initialized, setInitialized] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const { query } = useEditor();
  const { mutate: updateReportLayout, isLoading } = useUpdateReportLayout();
  const { projectId, phaseId } = useReportContext();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const disableSave = hasPendingState || saved;
  const disablePrint = hasPendingState || !saved;

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
    if (projectId && isCommunityMonitorProject(projectId, appConfig)) {
      clHistory.push('/admin/community-monitor/reports');
      return;
    }

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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const firstNode = nodes.ROOT?.nodes[0];
      if (!firstNode) return;

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const type = nodes?.[firstNode].type;
      const resolvedName =
        typeof type === 'object' ? type.resolvedName : undefined;

      if (!isTemplateNode(resolvedName)) {
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
        resolvedName === 'ProjectTemplate' &&
        numberOfNodes < PROJECT_TEMPLATE_MIN_NUMBER_OF_NODES_BEFORE_AUTOSAVE
      ) {
        return;
      }
      if (
        resolvedName === 'PlatformTemplate' &&
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
      <GoBackButton onClick={goBack} />
      <Box display="flex" p="15px" pl="8px" flexGrow={1} alignItems="center">
        <Box flexGrow={2}>
          <ReportTitle reportId={reportId} />

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
          <Tooltip
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
                buttonStyle="secondary-outlined"
                iconColor={colors.textPrimary}
                iconSize="16px"
                px="12px"
                py="8px"
                onClick={() => {
                  // track any community monitor report print for user analytics
                  if (
                    projectId &&
                    isCommunityMonitorProject(projectId, appConfig)
                  ) {
                    trackEventByName(tracks.communinityMonitorReportPrinted);
                  }

                  clHistory.push(
                    `/admin/reporting/report-builder/${reportId}/print`
                  );
                }}
                openLinkInNewTab
                disabled={disablePrint}
              />
            </div>
          </Tooltip>
        </Box>
        <SaveButton
          isDisabled={disableSave}
          isLoading={isLoading}
          isSaved={saved}
          onSave={handleSave}
        />
      </Box>
    </Container>
  );
};

export default ContentBuilderTopBar;
