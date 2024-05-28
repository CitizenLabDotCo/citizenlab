interface Params {
  templateProjectId: string | null;
  templatePhaseId: string | null;
  startDateStrategicReport: string | null;
  endDateStrategicReport: string | null;
}

export const getTemplateConfig = ({
  templateProjectId,
  templatePhaseId,
  startDateStrategicReport,
  endDateStrategicReport,
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

  if (startDateStrategicReport && endDateStrategicReport) {
    return {
      template: 'strategic',
      startDate: startDateStrategicReport,
      endDate: endDateStrategicReport,
    };
  }

  return undefined;
};

export type TemplateConfig =
  | ProjectTemplateConfig
  | PhaseTemplateConfig
  | StrategicTemplateConfig;

type ProjectTemplateConfig = {
  template: 'project';
  projectId: string;
};

type PhaseTemplateConfig = {
  template: 'phase';
  phaseId: string;
};

type StrategicTemplateConfig = {
  template: 'strategic';
  startDate: string;
  endDate: string;
};
