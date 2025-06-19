import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Input,
  Label,
  colors,
  Select,
} from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useAddReport, { AddReport } from 'api/reports/useAddReport';

import { generateYearSelectOptions } from 'containers/Admin/reporting/utils/generateYearSelectOptions';
import reportTitleIsTaken from 'containers/Admin/reporting/utils/reportTitleIsTaken';

import { DateRange } from 'components/admin/DatePickers/_shared/typings';
import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import ProjectFilter from 'components/UI/ProjectFilter';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import RadioButtons from './RadioButtons';
import { Template } from './typings';
import { getRedirectUrl } from './utils';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateReportModal = ({ open, onClose }: Props) => {
  const { mutate: createReport, isLoading } = useAddReport();
  const { data: project } = useCommunityMonitorProject({});
  const communityMonitorPhaseId =
    project?.data.relationships.current_phase?.data?.id;

  const [reportTitle, setReportTitle] = useState('');
  const [template, setTemplate] = useState<Template>('blank');
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [dates, setDates] = useState<Partial<DateRange>>({});
  const [year, setYear] = useState<number | null>(null);
  const [quarter, setQuarter] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { formatMessage } = useIntl();
  const reportTitleTooShort = reportTitle.length <= 2;

  const blockSubmit =
    reportTitleTooShort ||
    (template === 'project' ? selectedProjectId === undefined : false) ||
    (template === 'platform' ? !dates.from || !dates.to : false) ||
    (template === 'community-monitor' ? !year || !quarter : false);

  const handleProjectFilter = (option: IOption) => {
    setSelectedProjectId(option.value === '' ? undefined : option.value);
  };

  const onCreateReport = async () => {
    if (blockSubmit) return;
    setErrorMessage(undefined);

    const createReportParams: AddReport = {
      phase_id:
        template === 'community-monitor' ? communityMonitorPhaseId : undefined,
      name: reportTitle,
    };

    createReport(createReportParams, {
      onSuccess: (report) => {
        clHistory.push(
          getRedirectUrl({
            reportId: report.data.id,
            selectedProjectId,
            year,
            quarter,
            template,
            dates,
          })
        );
      },
      onError: (e) => {
        if (reportTitleIsTaken(e)) {
          setErrorMessage(formatMessage(messages.reportTitleAlreadyExists));
        } else {
          setErrorMessage(formatMessage(messages.anErrorOccurred));
        }
      },
    });
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="40px">
          {formatMessage(messages.createReportModalTitle)}
        </Title>
        <Text
          color="primary"
          fontSize="s"
          textAlign="center"
          mt="0px"
          mb="32px"
        >
          {formatMessage(messages.customizeReport)}
        </Text>
        <Input
          className="e2e-create-report-modal-title-input"
          value={reportTitle}
          type="text"
          label={formatMessage(messages.createReportModalInputLabel)}
          onChange={setReportTitle}
          disabled={isLoading}
        />
        <Box as="fieldset" border="0px" width="100%" p="0px" mt="28px">
          <Label>{formatMessage(messages.reportTemplate)}</Label>
          <RadioButtons value={template} onChange={setTemplate} />
        </Box>
        {template === 'community-monitor' && (
          <Box width="100%" mt="12px">
            <Box mb="16px">
              <Select
                id="e2e-year-select"
                placeholder={formatMessage(messages.selectYear)}
                value={year}
                options={generateYearSelectOptions(2025)} // Genereates list: 2025 until current year
                onChange={(option) => setYear(option.value)}
              />
            </Box>

            <Select
              id="e2e-quarter-select"
              placeholder={formatMessage(messages.selectQuarter)}
              value={quarter}
              options={[1, 2, 3, 4].map((quarter) => ({
                label: formatMessage(messages.quarter, {
                  quarterValue: quarter,
                }), // e.g., "Quarter 1"
                value: quarter,
              }))}
              onChange={(option) => setQuarter(option.value)}
            />
          </Box>
        )}
        {template === 'project' && (
          <Box width="100%" mt="12px">
            <ProjectFilter
              projectId={selectedProjectId}
              emptyOptionMessage={messages.noProjectSelected}
              onProjectFilter={handleProjectFilter}
            />
          </Box>
        )}
        {template === 'platform' && (
          <Box width="100%" mt="12px" display="flex">
            <DateRangePicker selectedRange={dates} onUpdateRange={setDates} />
          </Box>
        )}
        {errorMessage && (
          <Box mt="12px">
            <Error text={errorMessage} />
          </Box>
        )}
        <ButtonWithLink
          bgColor={colors.primary}
          width="auto"
          mt="40px"
          mb="40px"
          disabled={blockSubmit || isLoading}
          processing={isLoading}
          data-testid="create-report-button"
          onClick={onCreateReport}
        >
          {formatMessage(messages.emptyStateButtonText)}
        </ButtonWithLink>
      </Box>
    </Modal>
  );
};

export default CreateReportModal;
