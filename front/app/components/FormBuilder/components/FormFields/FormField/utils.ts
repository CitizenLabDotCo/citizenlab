import { MessageDescriptor } from 'react-intl';

import { Conflict, LogicConflictType } from 'components/FormBuilder/edit/utils';

import messages from './messages';

/**
 * Returns the appropriate message descriptor based on an array of conflicts for a page.
 * @param conflicts - Array of Conflict objects for the page
 * @returns The MessageDescriptor for the translated string
 */
export function getConflictMessageKey(
  conflicts: Conflict[] | undefined
): MessageDescriptor | undefined {
  const conflictTypes = new Set(
    (conflicts ?? []).map((conflict) => conflict.conflictType)
  );
  if (
    conflictTypes.has(LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT) &&
    conflictTypes.has(LogicConflictType.QUESTION_VS_PAGE_LOGIC) &&
    conflictTypes.has(LogicConflictType.INTER_QUESTION_CONFLICT)
  ) {
    return messages.multipleConflictTypes;
  }

  if (
    conflictTypes.has(LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT) &&
    conflictTypes.has(LogicConflictType.QUESTION_VS_PAGE_LOGIC)
  ) {
    return messages.multipleGotoInMultiSelectAndQuestionVsPageLogic;
  }

  if (
    conflictTypes.has(LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT) &&
    conflictTypes.has(LogicConflictType.INTER_QUESTION_CONFLICT)
  ) {
    return messages.multipleGotoInMultiSelectAndInterQuestionConflict;
  }

  if (
    conflictTypes.has(LogicConflictType.QUESTION_VS_PAGE_LOGIC) &&
    conflictTypes.has(LogicConflictType.INTER_QUESTION_CONFLICT)
  ) {
    return messages.questionVsPageLogicAndInterQuestionConflict;
  }

  // Individual conflict types
  if (conflictTypes.has(LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT)) {
    return messages.multipleGotoInMultiSelect;
  }

  if (conflictTypes.has(LogicConflictType.QUESTION_VS_PAGE_LOGIC)) {
    return messages.questionVsPageLogic;
  }

  if (conflictTypes.has(LogicConflictType.INTER_QUESTION_CONFLICT)) {
    return messages.interQuestionConflict;
  }

  // No conflicts found
  return undefined;
}
