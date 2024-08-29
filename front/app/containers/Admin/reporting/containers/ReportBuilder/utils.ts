interface Params {
  templateProjectId: string | null;
  templatePhaseId: string | null;
  startDatePlatformReport: string | null;
  endDatePlatformReport: string | null;
}

export const getTemplateConfig = ({
  templateProjectId,
  templatePhaseId,
  startDatePlatformReport,
  endDatePlatformReport,
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
  | PlatformTemplateConfig;

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
