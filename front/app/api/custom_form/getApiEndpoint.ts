import { IPhaseData } from 'api/phases/types';

const getApiEndpoint = (phase: IPhaseData) => {
  const participationMethod = phase.attributes.participation_method;

  /* For Ideation & voting, when you configure the form it gets applied to ALL ideation/voting phases within a project, 
  however when you configure the form for surveys for example, 
  each survey phase within a project can have a different form. 
  Hence we call different endpoints depending on the participation method. */
  return participationMethod === 'ideation' || participationMethod === 'voting'
    ? `projects/${phase.relationships.project.data.id}/custom_form`
    : `phases/${phase.id}/custom_form`;
};

export default getApiEndpoint;
