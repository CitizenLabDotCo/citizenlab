import React, { ReactNode } from 'react';

import { useRouter } from '@tanstack/react-router';

import Banner from 'design-system/Banner';
import Disclosure from 'design-system/Disclosure';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import { IPhaseData } from 'api/phases/types';
import { PHASE_REPORT_TEMPLATE_METHODS } from 'api/reports/constants';
import useAddReport from 'api/reports/useAddReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import projectMessages from 'containers/Admin/projects/project/messages';
import reportTitleIsTaken from 'containers/Admin/reporting/utils/reportTitleIsTaken';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';

import messages from './messages';
import styles from './RecommendedActions.module.css';
import 'design-system/tokens.css';

const MAX_REPORT_NAME_ATTEMPTS = 10;

interface Props {
  phase: IPhaseData;
  children: ReactNode;
}

const RecommendedActions = ({ phase, children }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const router = useRouter();
  const reportBuilderEnabled = useReportBuilderEnabled();
  const {
    mutateAsync: addReport,
    data: report,
    isPending,
    isError,
  } = useAddReport();
  const projectId = phase.relationships.project.data.id;
  const supportsPhaseTemplate = PHASE_REPORT_TEMPLATE_METHODS.includes(
    phase.attributes.participation_method
  );

  // Report names are unique across the platform, and several reports can
  // cover the same phase.
  const addPhaseReport = async () => {
    const title = localize(phase.attributes.title_multiloc);

    for (let attempt = 1; attempt <= MAX_REPORT_NAME_ATTEMPTS; attempt++) {
      try {
        await addReport({
          name: attempt === 1 ? title : `${title} (${attempt})`,
        });
        return;
      } catch (error) {
        if (!reportTitleIsTaken(error)) return;
      }
    }
  };

  const messagingHref = router.buildLocation({
    to: '/$locale/admin/projects/$projectId/messaging',
    params: { locale, projectId },
  }).href;
  const projectPageEditorHref = router.buildLocation({
    to: '/$locale/admin/project-page-builder/projects/$projectId',
    params: { locale, projectId },
  }).href;
  const informationPhaseHref = router.buildLocation({
    to: '/$locale/admin/projects/$projectId/phases/new',
    params: { locale, projectId },
    search: { participation_method: 'information' },
  }).href;

  if (report) {
    return (
      <Navigate
        to="/admin/reporting/report-builder/$reportId/editor"
        params={{ reportId: report.data.id }}
        search={{
          templatePhaseId: supportsPhaseTemplate ? phase.id : undefined,
        }}
      />
    );
  }

  return (
    <aside
      aria-label={formatMessage(messages.recommendedActions)}
      className={styles.panel}
    >
      <p className={styles.title}>
        {formatMessage(messages.recommendedActions)}
      </p>
      {reportBuilderEnabled && (
        <Disclosure
          header="button"
          title={formatMessage(messages.addReport)}
          actionIcon="file-chart-column-16"
          isPending={isPending}
          onPress={addPhaseReport}
        />
      )}
      {isError && (
        <Banner tone="error">
          {formatMessage(messages.reportCreationFailed)}
        </Banner>
      )}
      <MenuTrigger>
        <Disclosure
          header="button"
          title={formatMessage(messages.shareResults)}
          actionIcon="chevron-down-16"
        />
        <Menu aria-label={formatMessage(messages.shareResults)}>
          <MenuItem href={messagingHref}>
            {formatMessage(messages.goToMessaging)}
          </MenuItem>
          <MenuItem href={projectPageEditorHref}>
            {formatMessage(messages.editProjectPage)}
          </MenuItem>
          <MenuItem href={informationPhaseHref}>
            {formatMessage(messages.createInformationPhase)}
          </MenuItem>
        </Menu>
      </MenuTrigger>
      {children}
      {phase.attributes.participation_method === 'document_annotation' && (
        <div role="note">
          <Banner tone="neutral">
            {formatMessage(projectMessages.konveioParticipationDataNotice)}
          </Banner>
        </div>
      )}
    </aside>
  );
};

export default RecommendedActions;
