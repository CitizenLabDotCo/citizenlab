import { TPhases } from 'api/phases/types';
import {
  IPCPermissionData,
  IPCPermissions,
} from 'api/project_permissions/types';
import { IProjectData } from 'api/projects/types';
import { isNilOrError } from 'utils/helperUtils';

export const hasEmbeddedSurvey = (
  project: IProjectData,
  phases: TPhases | null
) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.map((phase) => {
      if (phase.attributes.participation_method === 'survey') {
        hasSurveyPhase = true;
      }
    });
  }
  if (project.attributes.participation_method === 'survey') {
    hasSurveyPhase = true;
  }
  return hasSurveyPhase;
};

export interface NestedIPCPermissions {
  data: { data: IPCPermissionData[] };
}

export const hasSurveyWithAnyonePermissions = (
  projectPermissions: IPCPermissions | undefined,
  phasesPermissions: NestedIPCPermissions[] | undefined | null
) => {
  let hasSurveyWithAnyonePermissions = false;

  if (!isNilOrError(phasesPermissions) && phasesPermissions.length > 0) {
    phasesPermissions.map((permissions) => {
      if (permissions.data && permissions.data.data) {
        permissions.data.data.map((permission) => {
          if (permission.attributes.permitted_by === 'everyone') {
            hasSurveyWithAnyonePermissions = true;
          }
        });
      }
    });
  } else if (projectPermissions) {
    if (projectPermissions.data.length > 0) {
      projectPermissions.data.map((permission) => {
        if (permission.attributes.permitted_by === 'everyone') {
          hasSurveyWithAnyonePermissions = true;
        }
      });
    }
  }

  return hasSurveyWithAnyonePermissions;
};
