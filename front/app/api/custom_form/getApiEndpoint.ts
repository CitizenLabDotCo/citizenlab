import { IPhaseData } from 'api/phases/types';

const getApiEndpoint = (phase: IPhaseData) => {
  /* For Ideation, when you configure the form it gets applied to ALL ideation phases within a project, 
  however when you configure the form for surveys for example, 
  each survey phase within a project can have a different form */
  return phase.attributes.participation_method === 'ideation'
    ? `projects/${phase.relationships.project.data.id}/custom_form`
    : `phases/${phase.id}/custom_form`;
};

export default getApiEndpoint;
