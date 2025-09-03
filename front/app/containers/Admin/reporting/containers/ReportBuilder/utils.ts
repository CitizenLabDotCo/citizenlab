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
