import React from 'react';

// api
import usePhase from 'api/phases/usePhase';
import useAddReport from 'api/reports/useAddReport';
import useReport from 'api/reports/useReport';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ReportRow from './ReportRow';

// styling

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  phaseId: string;
}

const ReportSection = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { mutate: createReport, isLoading } = useAddReport();
  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });

  const reportId = phase?.data.relationships.report?.data?.id;
  const { data: report } = useReport(reportId);

  if (phase === undefined || !phaseReportsEnabled) return null;

  const handleCreateReport = () => {
    createReport({ phase_id: phaseId });
  };

  return (
    <SectionField className="fullWidth">
      <Box display="flex">
        <SubSectionTitle>
          {report ? (
            <FormattedMessage {...messages.viewReport} />
          ) : (
            <FormattedMessage {...messages.createAReport} />
          )}
        </SubSectionTitle>
      </Box>
      {!report && (
        <>
          <Text m="0" color="textSecondary">
            <FormattedMessage {...messages.theReportAllowsYouTo} />
          </Text>
          <ul>
            <li>
              <Text m="0" color="textSecondary">
                <FormattedMessage {...messages.shareResults} />
              </Text>
            </li>
            <li>
              <Text m="0" color="textSecondary">
                <FormattedMessage {...messages.createAFullyCustomPage} />
              </Text>
            </li>
          </ul>
          <Box display="flex" mt="8px">
            <Button
              width="auto"
              processing={isLoading}
              bgColor={colors.primary}
              onClick={handleCreateReport}
            >
              <FormattedMessage {...messages.createAReport} />
            </Button>
          </Box>
        </>
      )}
      {report && <ReportRow report={report.data} />}
    </SectionField>
  );
};

export default ReportSection;
