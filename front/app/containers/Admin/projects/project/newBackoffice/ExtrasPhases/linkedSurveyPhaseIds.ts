import { CraftJson } from 'components/admin/ContentBuilder/typings';

// The phase ids of every survey linked on the project page through an
// "Extra surveys" widget in the saved page layout.
export const linkedSurveyPhaseIds = (
  craftjsJson: CraftJson | undefined
): Set<string> => {
  const ids = new Set<string>();

  Object.values(craftjsJson ?? {}).forEach((node) => {
    if (
      typeof node.type === 'object' &&
      node.type.resolvedName === 'ExtraSurveysWidget' &&
      typeof node.props.surveyPhaseId === 'string'
    ) {
      ids.add(node.props.surveyPhaseId);
    }
  });

  return ids;
};
