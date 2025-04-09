import { isEmpty } from 'lodash-es';

import { IProject } from 'api/projects/types';
import { ReportLayoutResponse } from 'api/report_layout/types';
import { ReportResponse } from 'api/reports/types';

interface Params {
  templateProjectId: string | null;
  templatePhaseId: string | null;
  startDatePlatformReport: string | null;
  endDatePlatformReport: string | null;
  templateYear: string | null;
  templateQuarter: string | null;
}

export const getTemplateConfig = ({
  templateProjectId,
  templatePhaseId,
  startDatePlatformReport,
  endDatePlatformReport,
  templateYear,
  templateQuarter,
}: Params): TemplateConfig | undefined => {
  if (templateProjectId) {
    return {
      template: 'project',
      projectId: templateProjectId,
    };
  }

  if (templatePhaseId) {
    return {
      template: 'phase',
      phaseId: templatePhaseId,
    };
  }

  if (templateYear && templateQuarter) {
    return {
      template: 'community-monitor',
      year: Number(templateYear),
      quarter: Number(templateQuarter),
    };
  }

  if (startDatePlatformReport && endDatePlatformReport) {
    return {
      template: 'platform',
      startDate: startDatePlatformReport,
      endDate: endDatePlatformReport,
    };
  }

  return undefined;
};

export type TemplateConfig =
  | ProjectTemplateConfig
  | PhaseTemplateConfig
  | PlatformTemplateConfig
  | CommunityMonitorTemplateConfig;

type CommunityMonitorTemplateConfig = {
  template: 'community-monitor';
  year: number;
  quarter: number;
};

type ProjectTemplateConfig = {
  template: 'project';
  projectId: string;
};

type PhaseTemplateConfig = {
  template: 'phase';
  phaseId: string;
};

type PlatformTemplateConfig = {
  template: 'platform';
  startDate: string;
  endDate: string;
};

interface IsGeneratedParams {
  report: ReportResponse | undefined;
  reportLayout: ReportLayoutResponse | undefined;
  communityMonitorProject: IProject | undefined;
}

// isGeneratedCommunityMonitorReport
// Description: Check if the report is one auto-generated for the Community Monitor.
export const isGeneratedCommunityMonitorReport = ({
  report,
  reportLayout,
  communityMonitorProject,
}: IsGeneratedParams) => {
  // Check if the report is one auto-generated for the Community Monitor
  const isCommunityMonitorReport =
    report?.data.relationships.phase?.data?.id ===
    communityMonitorProject?.data.relationships.current_phase?.data?.id;

  const isEmptyCommunityMonitorReport =
    isCommunityMonitorReport &&
    isEmpty(reportLayout?.data.attributes.craftjs_json);

  return isEmptyCommunityMonitorReport;
};
