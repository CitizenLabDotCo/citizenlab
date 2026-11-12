import React, { ReactNode } from 'react';

import {
  Box,
  Button,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { PHASE_REPORT_TEMPLATE_METHODS } from 'api/reports/constants';
import useAddReport from 'api/reports/useAddReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';

import useLocalize from 'hooks/useLocalize';

import MenuButton from 'components/admin/MenuButton';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';

import messages from './messages';

interface Props {
  phase: IPhaseData;
  children: ReactNode;
}

const RecommendedActions = ({ phase, children }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const reportBuilderEnabled = useReportBuilderEnabled();
  const {
    mutate: addReport,
    data: report,
    isPending,
    isError,
  } = useAddReport();
  const projectId = phase.relationships.project.data.id;
  const supportsPhaseTemplate = PHASE_REPORT_TEMPLATE_METHODS.includes(
    phase.attributes.participation_method
  );

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
    <Box
      as="aside"
      aria-label={formatMessage(messages.recommendedActions)}
      display="flex"
      flexDirection="column"
      gap="12px"
      p="18px"
      height="100%"
      background={colors.white}
      borderRadius={bo.panelBorderRadius}
    >
      <Text variant="boLabel" m="0">
        {formatMessage(messages.recommendedActions)}
      </Text>
      {reportBuilderEnabled && (
        <Button
          buttonStyle="bo-secondary"
          width="100%"
          justify="space-between"
          icon="reports"
          iconPos="right"
          processing={isPending}
          onClick={() =>
            addReport({ name: localize(phase.attributes.title_multiloc) })
          }
        >
          {formatMessage(messages.addReport)}
        </Button>
      )}
      {isError && (
        <Text variant="boHelper" color="red600" m="0" role="alert">
          {formatMessage(messages.reportCreationFailed)}
        </Text>
      )}
      <MenuButton
        portal
        width="280px"
        triggerWidth="100%"
        trigger={({ opened, toggle }) => (
          <Button
            buttonStyle="bo-secondary"
            width="100%"
            justify="space-between"
            icon="share"
            iconPos="right"
            ariaExpanded={opened}
            onClick={toggle}
          >
            {formatMessage(messages.shareResults)}
          </Button>
        )}
      >
        {(close) => (
          <Box display="flex" flexDirection="column" role="menu">
            <ButtonWithLink
              buttonStyle="bo-text"
              to="/admin/projects/$projectId/messaging"
              params={{ projectId }}
              onClick={close}
            >
              {formatMessage(messages.goToMessaging)}
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="bo-text"
              to="/admin/projects/$projectId"
              params={{ projectId }}
              onClick={close}
            >
              {formatMessage(messages.editProjectHomepage)}
            </ButtonWithLink>
            <ButtonWithLink
              buttonStyle="bo-text"
              to="/admin/projects/$projectId/phases/new"
              params={{ projectId }}
              search={{ participation_method: 'information' }}
              onClick={close}
            >
              {formatMessage(messages.createInformationPhase)}
            </ButtonWithLink>
          </Box>
        )}
      </MenuButton>
      {children}
      {phase.attributes.participation_method === 'document_annotation' && (
        <Box
          p="12px"
          background={colors.grey100}
          borderRadius={bo.borderRadius}
          role="note"
        >
          <Text variant="boHelper" m="0">
            {formatMessage(messages.konveioParticipationDataNotice)}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default RecommendedActions;
