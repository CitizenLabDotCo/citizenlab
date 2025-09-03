import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'api/custom_fields/types';

import { questionDNDType } from 'components/FormBuilder/components/FormFields/constants';

const reorder = <ListType>(
  list: ListType[],
  startIndex: number,
  endIndex: number
): ListType[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// Mapping of community monitor page keys to their category keys
const categoryPageKeyMapping: Record<string, string> = {
  page_quality_of_life: 'quality_of_life',
  page_service_delivery: 'service_delivery',
  page_governance_and_trust: 'governance_and_trust',
};

export const getQuestionCategory = (
  field: IFlatCustomField,
  customFields: IFlatCustomField[]
): string | undefined => {
  // Skip categorization for page-type fields
  if (field.input_type === 'page') return undefined;

  // Find the index of the current field
  const fieldIndex = customFields.findIndex((f) => f.id === field.id);

  // Search backwards from the current field to find the most recent page field
  const page = customFields
    .slice(0, fieldIndex)
    .reverse()
    .find((field) => field.input_type === 'page');

  // If a page is found and its key maps to a category, return the category
  // Otherwise, return undefined
  return page?.key && categoryPageKeyMapping[page.key]
    ? categoryPageKeyMapping[page.key]
    : undefined;
};

export const supportsLinearScaleLabels = (inputType: ICustomFieldInputType) => {
  return [
    'linear_scale',
    'sentiment_linear_scale',
    'matrix_linear_scale',
  ].includes(inputType);
};

export type NestedGroupingStructure = {
  questions: IFlatCustomField[];
  groupElement: IFlatCustomField;
  id: string;
};

type DragOrDropValues = {
  droppableId: string;
  index: number;
};

export type DragAndDropResult = {
  draggableId: string;
  type: string;
  source: DragOrDropValues;
  reason: string;
  mode: string;
  destination: DragOrDropValues | null;
};

const getFlatGroupStructure = (
  nestedGroupStructure: NestedGroupingStructure[]
): IFlatCustomField[] => {
  const flattenedGroupStructure: IFlatCustomField[] = [];
  nestedGroupStructure.forEach((group) => {
    flattenedGroupStructure.push(group.groupElement);
    group.questions.forEach((question) => {
      flattenedGroupStructure.push(question);
    });
  });
  return flattenedGroupStructure;
};

const getGroupQuestions = (
  groups: NestedGroupingStructure[],
  groupId: string
): IFlatCustomField[] => {
  const group = groups.find(
    (group) => group.id === groupId
  ) as NestedGroupingStructure;
  return group.questions;
};

export const getReorderedFields = (
  result: DragAndDropResult,
  nestedGroupData: NestedGroupingStructure[]
): IFlatCustomField[] | undefined => {
  const { type, source, destination } = result;
  if (!destination) return;

  const sourceGroupId = source.droppableId;
  const destinationGroupId = destination.droppableId;

  // REODERING QUESTION
  if (type === questionDNDType) {
    if (sourceGroupId === destinationGroupId) {
      // REORDERING QUESTION WITHIN SAME GROUP
      const updatedOrder = reorder<IFlatCustomField>(
        getGroupQuestions(nestedGroupData, sourceGroupId),
        source.index,
        destination.index
      );
      const updatedGroups = nestedGroupData.map((field) =>
        field.id !== sourceGroupId
          ? field
          : { ...field, questions: updatedOrder }
      );

      return getFlatGroupStructure(updatedGroups);
    } else {
      // REORDERING QUESTION TO DIFFERENT GROUP
      const sourceOrder = getGroupQuestions(nestedGroupData, sourceGroupId);
      const destinationOrder = getGroupQuestions(
        nestedGroupData,
        destinationGroupId
      );

      const [removed] = sourceOrder.splice(source.index, 1);
      destinationOrder.splice(destination.index, 0, removed);

      const updatedGroups = nestedGroupData.map((group) =>
        group.id === sourceGroupId
          ? { ...group, questions: sourceOrder }
          : group.id === destinationGroupId
          ? { ...group, questions: destinationOrder }
          : group
      );

      return getFlatGroupStructure(updatedGroups);
    }
  }

  // REORDERING GROUP
  const updatedGroups = reorder<NestedGroupingStructure>(
    nestedGroupData,
    source.index,
    destination.index
  );

  return getFlatGroupStructure(updatedGroups);
};

export enum LogicConflictType {
  MULTIPLE_GOTO_IN_MULTISELECT = 'MULTIPLE_GOTO_IN_MULTISELECT',
  QUESTION_VS_PAGE_LOGIC = 'QUESTION_VS_PAGE_LOGIC',
  INTER_QUESTION_CONFLICT = 'INTER_QUESTION_CONFLICT',
}

export interface Conflict {
  conflictType: LogicConflictType;
  pageId: string;
}

export function detectConflictsByPage(
  groupedData: NestedGroupingStructure[]
): Record<string, Conflict[] | undefined> {
  const conflictsByPage: Record<string, Conflict[] | undefined> = {};

  function addConflict(pageId: string, conflict: Conflict) {
    if (!conflictsByPage[pageId]) {
      conflictsByPage[pageId] = [];
    }
    conflictsByPage[pageId]!.push(conflict);
  }

  groupedData.forEach((pageGroup) => {
    const { groupElement, questions } = pageGroup;
    const pageId = groupElement.id;
    const pageNextId = groupElement.logic.next_page_id;

    // Gather goto-page-ids for the page-level logic check
    const questionGotoIdsForPage = new Set<string>();

    // Keep track of how many questions in this page have at least one goto
    let questionsWithGotoCount = 0;

    questions.forEach((question) => {
      // 1) Check MULTIPLE_GOTO_IN_MULTISELECT
      if (
        (question.input_type === 'multiselect' ||
          question.input_type === 'multiselect_image') &&
        question.logic.rules
      ) {
        const distinctGotoIds = new Set(
          question.logic.rules.map((rule) => rule.goto_page_id)
        );
        if (distinctGotoIds.size > 1 && question.logic.rules.length > 1) {
          addConflict(pageId, {
            conflictType: LogicConflictType.MULTIPLE_GOTO_IN_MULTISELECT,
            pageId,
          });
        }
      }

      // Collect all goto-page-ids from this question
      const questionGotoIds =
        question.logic.rules?.map((rule) => rule.goto_page_id) || [];

      if (questionGotoIds.length > 0) {
        questionsWithGotoCount += 1;
      }

      // For QUESTION_VS_PAGE_LOGIC, accumulate the distinct goto IDs
      questionGotoIds.forEach((gotoId) => {
        questionGotoIdsForPage.add(gotoId);
      });
    });

    // 2) Check QUESTION_VS_PAGE_LOGIC
    // If the page has a next_page_id, any mismatch is a conflict
    if (pageNextId) {
      for (const gotoId of questionGotoIdsForPage) {
        if (gotoId !== pageNextId) {
          addConflict(pageId, {
            conflictType: LogicConflictType.QUESTION_VS_PAGE_LOGIC,
            pageId,
          });
          break; // Once we find a mismatch, we can stop
        }
      }
    }

    // 3) Check INTER-QUESTION_CONFLICT
    // If more than 1 question on the page has a goto
    if (questionsWithGotoCount > 1) {
      addConflict(pageId, {
        conflictType: LogicConflictType.INTER_QUESTION_CONFLICT,
        pageId,
      });
    }
  });

  return conflictsByPage;
}
