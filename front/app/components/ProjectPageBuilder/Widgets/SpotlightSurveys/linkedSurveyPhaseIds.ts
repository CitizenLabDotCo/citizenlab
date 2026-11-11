import { getResolvedName } from 'components/admin/ContentBuilder/resolvedName';
import { CraftJson } from 'components/admin/ContentBuilder/typings';

export const linkedSurveyPhaseIds = (
  craftjsJson: CraftJson | undefined
): Set<string> => {
  const ids = new Set<string>();

  Object.values(craftjsJson ?? {}).forEach((node) => {
    if (
      getResolvedName(node) === 'ExtraSurveysWidget' &&
      typeof node.props.surveyPhaseId === 'string'
    ) {
      ids.add(node.props.surveyPhaseId);
    }
  });

  return ids;
};
