export type PulseCheckKey = 'project_setup_ease' | 'return_findability';

export type PulseCheckTrigger = 'save' | 'project_exit';

export type PulseCheckUiVersion =
  | 'project_backoffice_v1'
  | 'project_backoffice_v2';

export interface IPulseCheckData {
  id: string;
  type: 'pulse_check';
  attributes: {
    key: PulseCheckKey;
    status: 'pending' | 'shown' | 'answered' | 'dismissed' | 'expired';
  };
}

export interface IPulseCheck {
  data: IPulseCheckData;
}

export interface IShowNextPulseCheck {
  trigger: PulseCheckTrigger;
  uiVersion: PulseCheckUiVersion;
  adminArea?: string;
  projectId?: string;
}

export interface IPulseCheckAnswer {
  id: string;
  score: number;
  comment?: string;
}
