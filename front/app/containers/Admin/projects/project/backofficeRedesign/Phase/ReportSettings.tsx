import React, { useState } from 'react';

import {
  Box,
  Button,
  Text,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useReport from 'api/reports/useReport';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';
import useUpdateReport from 'api/reports/useUpdateReport';

import reportTabMessages from 'containers/Admin/projects/project/information/ReportTab/messages';
import useConfirmDeleteReport from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/useConfirmDeleteReport';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PanelField from './BuildPanel/PanelField';
import SummaryPill from './BuildPanel/SummaryPill';

interface Props {
  phase: IPhaseData;
}

const ReportSettings = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const [open, setOpen] = useState(false);
  const reportId = phase.relationships.report?.data?.id;
  const { data: report } = useReport(reportId);
  const { mutate: updateReport } = useUpdateReport();
  const { confirmDelete, isDeleting } = useConfirmDeleteReport();
  const reportBuilderEnabled = useReportBuilderEnabled();

  if (!reportBuilderEnabled || !report) return null;

  const label = formatMessage(reportTabMessages.report);
  const visible = report.data.attributes.visible;
  const canEdit =
    report.data.attributes.action_descriptors.editing_report.enabled;

  return (
    <PanelField
      label={label}
      action={
        <Box display="flex" alignItems="center" gap="4px">
          {!open && (
            <SummaryPill
              label={formatMessage(
                visible ? messages.reportVisible : messages.reportNotVisible
              )}
            />
          )}
          <Button
            buttonStyle="bo-text"
            icon={open ? 'chevron-up' : 'chevron-down'}
            iconSize="16px"
            width="28px"
            height="28px"
            padding="0"
            ariaLabel={label}
            ariaExpanded={open}
            onClick={() => setOpen((open) => !open)}
          />
        </Box>
      }
    >
      {open && (
        <>
          <Toggle
            size="small"
            checked={visible}
            onChange={() =>
              updateReport({ id: report.data.id, visible: !visible })
            }
            label={
              <Box>
                <Text as="span" display="block" variant="boControl" m="0">
                  {formatMessage(messages.reportVisibleToParticipants)}
                </Text>
                <Text as="span" display="block" variant="boHelper" m="0">
                  {formatMessage(messages.reportVisibleToParticipantsHelp)}
                </Text>
              </Box>
            }
          />
          <Box display="flex">
            <Button
              buttonStyle="bo-text"
              padding="0"
              height="auto"
              textColor={colors.red600}
              textHoverColor={colors.red800}
              processing={isDeleting}
              disabled={!canEdit}
              onClick={() => confirmDelete(report)}
            >
              {formatMessage(messages.deleteReport)}
            </Button>
          </Box>
        </>
      )}
    </PanelField>
  );
};

export default ReportSettings;
