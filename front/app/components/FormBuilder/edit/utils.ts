import { IFlatCustomField } from 'api/custom_fields/types';

import { questionDNDType } from 'components/FormBuilder/components/FormFields';

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

export type NestedGroupingStructure = {
  questions: IFlatCustomField[];
  groupElement: IFlatCustomField;
  id: string;
};

type DragOrDroValues = {
  droppableId: string;
  index: number;
};

export type DragAndDropResult = {
  draggableId: string;
  type: string;
  source: DragOrDroValues;
  reason: string;
  mode: string;
  destination: DragOrDroValues | null;
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

  if (type === questionDNDType) {
    if (sourceGroupId === destinationGroupId) {
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

  const updatedGroups = reorder<NestedGroupingStructure>(
    nestedGroupData,
    source.index,
    destination.index
  );

  return getFlatGroupStructure(updatedGroups);
};

export enum ConflictType {
  MULTIPLE_GOTO_IN_MULTISELECT = 'MULTIPLE_GOTO_IN_MULTISELECT',
  QUESTION_VS_PAGE_LOGIC = 'QUESTION_VS_PAGE_LOGIC',
  INTER_QUESTION_CONFLICT = 'INTER_QUESTION_CONFLICT',
  UNREACHABLE_PAGE = 'UNREACHABLE_PAGE',
}

export interface Conflict {
  conflictType: ConflictType;
  pageId: string;
}

/*
export function detectConflictsByPage(
  groupedData: NestedGroupingStructure[]
): Record<string, Conflict[] | undefined> {
  // The result structure: an object with keys = pageId, values = array of Conflict
  const conflictsByPage: Record<string, Conflict[] | undefined> = {};

  // A small helper to add a conflict for a specific page
  function addConflict(pageId: string, conflict: Conflict) {
    if (!conflictsByPage[pageId]) {
      conflictsByPage[pageId] = [];
    }
    conflictsByPage[pageId]!.push(conflict);
  }

  // 1. MULTIPLE_GOTO_IN_MULTISELECT
  groupedData.forEach((pageGroup) => {
    const { groupElement, questions } = pageGroup;
    const pageId = groupElement.id;

    questions.forEach((question) => {
      if (
        ['multiselect', 'multiselect_image'].includes(question.input_type) &&
        question.logic.rules
      ) {
        const distinctGotoIds = new Set(
          question.logic.rules.map((rule) => rule.goto_page_id)
        );
        // If multiple distinct goto_page_id exist, there's a conflict
        if (distinctGotoIds.size > 1 && question.logic.rules.length > 1) {
          addConflict(pageId, {
            conflictType: ConflictType.MULTIPLE_GOTO_IN_MULTISELECT,
            pageId,
          });
        }
      }
    });
  });

  // 2. QUESTION VS. PAGE-LEVEL LOGIC
  groupedData.forEach((pageGroup) => {
    const pageId = pageGroup.groupElement.id;
    const pageNextId = pageGroup.groupElement.logic.next_page_id;

    if (pageNextId) {
      // Gather distinct goto_page_ids from questions
      const questionGotoIds = new Set<string>();
      pageGroup.questions.forEach((question) => {
        question.logic.rules?.forEach((rule) => {
          questionGotoIds.add(rule.goto_page_id);
        });
      });

      // If we have questionGotoIds that differ from pageNextId, flag a conflict
      for (const gotoId of questionGotoIds) {
        if (gotoId !== pageNextId) {
          addConflict(pageId, {
            conflictType: ConflictType.QUESTION_VS_PAGE_LOGIC,
            pageId,
          });
        }
      }
    }
  });

  // 3. INTER-QUESTION CONFLICT
  groupedData.forEach((pageGroup) => {
    const pageId = pageGroup.groupElement.id;

    // Track whether we encounter a conflict
    let conflictDetected = false;

    // Track if any question has a goto_page_id rule
    let questionWithGotoExists = false;

    for (const question of pageGroup.questions) {
      const questionGotoIds = Array.from(
        new Set(question.logic.rules?.map((rule) => rule.goto_page_id) || [])
      );

      // If the question has at least one goto_page_id
      if (questionGotoIds.length > 0) {
        if (questionWithGotoExists) {
          // Conflict detected if a second question has a goto_page_id
          conflictDetected = true;
          break;
        } else {
          questionWithGotoExists = true;
        }
      }
    }

    // If a conflict is detected, add it
    if (conflictDetected) {
      addConflict(pageId, {
        conflictType: ConflictType.INTER_QUESTION_CONFLICT,
        pageId,
      });
    }
  });

  return conflictsByPage;
}
*/

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
            conflictType: ConflictType.MULTIPLE_GOTO_IN_MULTISELECT,
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
            conflictType: ConflictType.QUESTION_VS_PAGE_LOGIC,
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
        conflictType: ConflictType.INTER_QUESTION_CONFLICT,
        pageId,
      });
    }
  });

  return conflictsByPage;
}
