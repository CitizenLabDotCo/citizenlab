import { v4 as uuidv4 } from 'uuid';

import {
  IFlatCustomField,
  IMatrixStatementsType,
  IOptionsType,
  LogicType,
} from 'api/custom_fields/types';

// Function to replace all IDs with new UUIDs and update logic references
export const replaceIdsWithNewUuids = (
  fields: IFlatCustomField[]
): IFlatCustomField[] => {
  const idMapping: Record<string, string> = {};

  // First pass: collect all IDs and generate new UUIDs
  for (const field of fields) {
    idMapping[field.id] = uuidv4();

    field.options?.forEach((option) => {
      if (option.id) {
        idMapping[option.id] = uuidv4();
      }
    });

    field.matrix_statements?.forEach((statement) => {
      idMapping[statement.id] = uuidv4();
    });
  }

  // Second pass: replace IDs and update logic references
  const replaceIds = (field: IFlatCustomField): IFlatCustomField => {
    const result: IFlatCustomField = { ...field };

    // Replace field ID
    if (idMapping[field.id]) {
      result.id = idMapping[field.id];
    }

    // Replace option IDs
    if (field.options) {
      result.options = field.options.map((option: IOptionsType) => ({
        ...option,
        id:
          option.id && idMapping[option.id] ? idMapping[option.id] : option.id,
      }));
    }

    // Replace matrix statement IDs
    if (field.matrix_statements) {
      result.matrix_statements = field.matrix_statements.map(
        (statement: IMatrixStatementsType) => ({
          ...statement,
          id: idMapping[statement.id] ?? statement.id,
        })
      );
    }

    // Update logic references
    const logic = field.logic;
    const newLogic: LogicType = {};

    if (logic.next_page_id) {
      newLogic.next_page_id =
        idMapping[logic.next_page_id] ?? logic.next_page_id;
    }

    if (logic.rules) {
      newLogic.rules = logic.rules.map((rule) => ({
        ...rule,
        goto_page_id: idMapping[rule.goto_page_id] ?? rule.goto_page_id,
        if:
          typeof rule.if === 'string' && idMapping[rule.if]
            ? idMapping[rule.if]
            : rule.if,
      }));
    }

    result.logic = newLogic;

    return result;
  };

  return fields.map(replaceIds);
};
