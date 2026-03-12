import { FormatMessage } from 'typings';
import { object, boolean, array, string, number } from 'yup';

import {
  ICustomFieldInputType,
  IFlatCustomField,
} from 'api/custom_fields/types';

import { getInitialLinearScaleLabel } from 'components/FormBuilder/components/FormBuilderToolbox/utils';
import {
  questionDNDType,
  fieldAreaDNDType,
} from 'components/FormBuilder/components/FormFields/constants';

import { generateTempId } from 'utils/helperUtils';
import validateElementTitle from 'utils/yup/validateElementTitle';
import validateLogic from 'utils/yup/validateLogic';
import validateOneOptionForMultiSelect from 'utils/yup/validateOneOptionForMultiSelect';
import validateOneStatementForMatrix from 'utils/yup/validateOneStatementForMatrix';

import messages from '../messages';

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
  if (type === questionDNDType || type === fieldAreaDNDType) {
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

export const getNestedGroupData = (
  formCustomFields?: IFlatCustomField[]
): NestedGroupingStructure[] => {
  return (
    formCustomFields?.reduce((groups, field) => {
      if (field.input_type === 'page') {
        groups.push({
          groupElement: field,
          questions: [],
          id: field.id,
        });
      } else {
        const lastGroup = groups[groups.length - 1];
        lastGroup.questions.push({ ...field });
      }
      return groups;
    }, [] as NestedGroupingStructure[]) || []
  );
};

const nullableNumber = number()
  .transform((value, originalValue) => {
    // If the original input is null or an empty string, transform it to null.
    if (
      originalValue === null ||
      (typeof originalValue === 'string' && originalValue.trim() === '')
    ) {
      return null;
    }

    // The 'value' is already cast by Yup. If it's not a valid number (NaN), return null.
    return isNaN(value) ? null : value;
  })
  .nullable();

export const createValidationSchema = (formatMessage: FormatMessage) => {
  return object().shape({
    customFields: array()
      .of(
        object().shape({
          title_multiloc: validateElementTitle(
            formatMessage(messages.emptyTitleError)
          ),
          description_multiloc: object(),
          input_type: string(),
          options: validateOneOptionForMultiSelect(
            formatMessage(messages.emptyOptionError),
            formatMessage(messages.emptyTitleMessage),
            { multiselect_image: formatMessage(messages.emptyImageOptionError) }
          ),
          matrix_statements: validateOneStatementForMatrix(
            formatMessage(messages.emptyStatementError),
            formatMessage(messages.emptyTitleStatementMessage)
          ),
          maximum: number(),
          linear_scale_label_1_multiloc: object(),
          linear_scale_label_2_multiloc: object(),
          linear_scale_label_3_multiloc: object(),
          linear_scale_label_4_multiloc: object(),
          linear_scale_label_5_multiloc: object(),
          linear_scale_label_6_multiloc: object(),
          linear_scale_label_7_multiloc: object(),
          linear_scale_label_8_multiloc: object(),
          linear_scale_label_9_multiloc: object(),
          linear_scale_label_10_multiloc: object(),
          linear_scale_label_11_multiloc: object(),
          required: boolean(),
          ask_follow_up: boolean(),
          include_in_printed_form: boolean(),
          min_characters: nullableNumber,
          max_characters: nullableNumber,
          temp_id: string(),
          logic: validateLogic(formatMessage(messages.logicValidationError)),
        })
      )
      .required(),
  });
};

export const createNewField = (
  type: ICustomFieldInputType,
  locale: string,
  formatMessage: FormatMessage
) => {
  return {
    id: `${Math.floor(Date.now() * Math.random())}`,
    temp_id: generateTempId(),
    logic: {
      ...(type !== 'page' ? { rules: [] } : undefined),
    },
    isLocalOnly: true,
    description_multiloc: {},
    input_type: type,
    required: false,
    title_multiloc: {
      [locale]: '',
    },
    // Set default character limits for text-supporting fields (excluding html_multiloc)
    ...(['text', 'multiline_text', 'text_multiloc'].includes(type) && {
      min_characters: 2,
      max_characters: type === 'text_multiloc' ? 120 : undefined,
    }),
    linear_scale_label_1_multiloc: getInitialLinearScaleLabel({
      value: 1,
      inputType: type,
      formatMessage,
      locale,
    }),
    linear_scale_label_2_multiloc: getInitialLinearScaleLabel({
      value: 2,
      inputType: type,
      formatMessage,
      locale,
    }),
    linear_scale_label_3_multiloc: getInitialLinearScaleLabel({
      value: 3,
      inputType: type,
      formatMessage,
      locale,
    }),
    linear_scale_label_4_multiloc: getInitialLinearScaleLabel({
      value: 4,
      inputType: type,
      formatMessage,
      locale,
    }),
    linear_scale_label_5_multiloc: getInitialLinearScaleLabel({
      value: 5,
      inputType: type,
      formatMessage,
      locale,
    }),
    linear_scale_label_6_multiloc: {},
    linear_scale_label_7_multiloc: {},
    linear_scale_label_8_multiloc: {},
    linear_scale_label_9_multiloc: {},
    linear_scale_label_10_multiloc: {},
    linear_scale_label_11_multiloc: {},
    maximum: 5,
    ask_follow_up: false,
    options: [
      {
        title_multiloc: {},
      },
    ],
    matrix_statements: [
      {
        title_multiloc: {},
      },
    ],
    enabled: true,
  };
};

export const transformFieldForSubmission = (
  field: IFlatCustomField,
  customFields: IFlatCustomField[]
) => {
  return {
    ...(!field.isLocalOnly && { id: field.id }),
    input_type: field.input_type,
    ...(field.input_type === 'page' && {
      temp_id: field.temp_id,
    }),
    ...([
      'multiselect',
      'linear_scale',
      'select',
      'page',
      'rating',
      'multiselect_image',
    ].includes(field.input_type)
      ? {
          logic: field.logic,
        }
      : {
          logic: [],
        }),
    required: field.required,
    enabled: field.enabled,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    title_multiloc: field.title_multiloc || {},
    key: field.key,
    code: field.code,
    question_category: getQuestionCategory(field, customFields),
    ...(field.page_layout || field.input_type === 'page'
      ? {
          page_layout: field.page_layout || 'default',
          page_button_label_multiloc: field.page_button_label_multiloc || {},
          page_button_link: field.page_button_link || '',
          include_in_printed_form:
            field.include_in_printed_form === undefined
              ? true
              : field.include_in_printed_form,
        }
      : {}),
    ...(field.map_config_id && {
      map_config_id: field.map_config_id,
    }),
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    description_multiloc: field.description_multiloc || {},
    ...(['select', 'multiselect', 'multiselect_image'].includes(
      field.input_type
    ) && {
      // TODO: This will get messy with more field types, abstract this in some way
      options: field.options || {},
      maximum_select_count: field.select_count_enabled
        ? field.maximum_select_count
        : null,
      minimum_select_count: field.select_count_enabled
        ? field.minimum_select_count || 0
        : null,
      select_count_enabled: field.select_count_enabled,
      random_option_ordering: field.random_option_ordering,
      dropdown_layout: field.dropdown_layout,
    }),
    ...(field.input_type === 'topic_ids' && {
      maximum_select_count: field.select_count_enabled
        ? field.maximum_select_count
        : null,
      minimum_select_count: field.select_count_enabled
        ? field.minimum_select_count || 0
        : null,
      select_count_enabled: field.select_count_enabled,
    }),
    ...(field.input_type === 'ranking' && {
      options: field.options || {},
      random_option_ordering: field.random_option_ordering,
    }),
    ...(field.input_type === 'matrix_linear_scale' && {
      matrix_statements: field.matrix_statements || {},
    }),
    ...(field.input_type === 'sentiment_linear_scale' && {
      ask_follow_up: field.ask_follow_up || false,
    }),
    ...(supportsLinearScaleLabels(field.input_type) && {
      linear_scale_label_1_multiloc: field.linear_scale_label_1_multiloc || {},
      linear_scale_label_2_multiloc: field.linear_scale_label_2_multiloc || {},
      linear_scale_label_3_multiloc: field.linear_scale_label_3_multiloc || {},
      linear_scale_label_4_multiloc: field.linear_scale_label_4_multiloc || {},
      linear_scale_label_5_multiloc: field.linear_scale_label_5_multiloc || {},
      linear_scale_label_6_multiloc: field.linear_scale_label_6_multiloc || {},
      linear_scale_label_7_multiloc: field.linear_scale_label_7_multiloc || {},
      linear_scale_label_8_multiloc: field.linear_scale_label_8_multiloc || {},
      linear_scale_label_9_multiloc: field.linear_scale_label_9_multiloc || {},
      linear_scale_label_10_multiloc:
        field.linear_scale_label_10_multiloc || {},
      linear_scale_label_11_multiloc:
        field.linear_scale_label_11_multiloc || {},
      maximum: field.maximum?.toString() || '5',
    }),
    ...(field.input_type === 'rating' && {
      maximum: field.maximum?.toString() || '5',
    }),
    ...(['text', 'multiline_text', 'text_multiloc', 'html_multiloc'].includes(
      field.input_type
    ) && {
      min_characters: field.min_characters,
      max_characters: field.max_characters,
    }),
  };
};

const handlePageReordering = (
  destinationIndex: number,
  formCustomFields: IFlatCustomField[],
  nestedGroupData: NestedGroupingStructure[]
) => {
  // If dropping beyond the available pages, place before the form_end page
  if (destinationIndex >= nestedGroupData.length) {
    return formCustomFields.length - 1;
  }

  // Find the target page at the destination index
  const targetPage = nestedGroupData[destinationIndex];
  // Get the index of this page in the flat array
  const pageIndex = formCustomFields.findIndex(
    (field) => field.id === targetPage.groupElement.id
  );

  if (pageIndex !== -1) {
    return pageIndex;
  }

  // Fallback: insert before form_end
  return formCustomFields.length - 1;
};

const handleCustomFieldReordering = (
  destinationGroupId: string,
  destinationIndex: number,
  formCustomFields: IFlatCustomField[],
  nestedGroupData: NestedGroupingStructure[]
) => {
  const targetPage = nestedGroupData.find(
    (group) => group.id === destinationGroupId
  );

  if (targetPage) {
    // Get the index of the page element in the flat array
    const pageIndex = formCustomFields.findIndex(
      (field) => field.id === targetPage.groupElement.id
    );

    if (pageIndex !== -1) {
      // Calculate target index: page position + 1 (to skip the page element) + field position within the page
      return pageIndex + 1 + destinationIndex;
    }
  }

  // Fallback: insert before form_end
  return formCustomFields.length - 1;
};

export const calculateDropTargetIndex = (
  result: DragAndDropResult,
  formCustomFields: IFlatCustomField[],
  nestedGroupData: NestedGroupingStructure[]
) => {
  const destinationGroupId = result.destination?.droppableId;
  const destinationIndex = result.destination?.index || 0;

  if (!destinationGroupId) return null;

  if (destinationGroupId === 'droppable') {
    return handlePageReordering(
      destinationIndex + 1,
      formCustomFields,
      nestedGroupData
    );
  }

  return handleCustomFieldReordering(
    destinationGroupId,
    destinationIndex,
    formCustomFields,
    nestedGroupData
  );
};

export const handleBuiltInFieldEnablement = (
  fieldKey: string,
  formCustomFields: IFlatCustomField[],
  result: DragAndDropResult,
  nestedGroupData: NestedGroupingStructure[],
  setValue: (name: string, value: IFlatCustomField) => void,
  move: (fromIndex: number, toIndex: number) => void
): {
  success: boolean;
  updatedField?: IFlatCustomField;
  targetIndex?: number;
} => {
  // Find the built-in field
  const fieldIndex = formCustomFields.findIndex((f) => f.key === fieldKey);

  if (fieldIndex === -1) {
    return { success: false };
  }

  const field = formCustomFields[fieldIndex];

  // Check if already enabled
  if (field.enabled) {
    return { success: false };
  }

  // Calculate target index for positioning BEFORE enabling the field
  const targetIndex = calculateDropTargetIndex(
    result,
    formCustomFields,
    nestedGroupData
  );

  if (targetIndex === null) {
    return { success: false };
  }

  // Enable the field
  const updatedField = { ...field, enabled: true };
  setValue(`customFields.${fieldIndex}`, updatedField);

  // Adjust target index if we're moving the field to a position after its current position
  const adjustedTargetIndex =
    targetIndex > fieldIndex ? targetIndex - 1 : targetIndex;

  // Move the enabled field to the target position
  move(fieldIndex, adjustedTargetIndex);

  return {
    success: true,
    updatedField,
    targetIndex: adjustedTargetIndex,
  };
};
