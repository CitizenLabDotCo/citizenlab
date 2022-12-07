import { IFlatCustomField } from 'services/formCustomFields';

export const movePageWithQuestions = (
  fields: IFlatCustomField[],
  fromIndex: number,
  toIndex: number
) => {
  let usedFromIndex = fromIndex;
  let usedToIndex = toIndex;

  if (fromIndex < toIndex) {
    usedFromIndex = toIndex;
    usedToIndex = fromIndex;
  }

  // First, find the starting index of the page we want to move
  let pageStartIndex = -1;
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found a page - check if it's the page we want to move
      if (usedFromIndex === 0) {
        pageStartIndex = i;
        break;
      }
      usedFromIndex--;
    }
  }

  // If we didn't find the page, return the original array
  if (pageStartIndex === -1) {
    return fields;
  }

  // Now, find the ending index of the page we want to move
  let pageEndIndex = -1;
  for (let i = pageStartIndex + 1; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found another page, so the previous page must have ended
      pageEndIndex = i - 1;
      break;
    }
  }

  // If we didn't find the end of the page, it must be the last item in the array
  if (pageEndIndex === -1) {
    pageEndIndex = fields.length - 1;
  }

  // Create a new array that contains the items from the original array,
  // except for the page we want to move
  const newArray: IFlatCustomField[] = [];
  for (let i = 0; i < fields.length; i++) {
    if (i < pageStartIndex || i > pageEndIndex) {
      newArray.push(fields[i]);
    }
  }

  // Find the index where we want to insert the page
  let insertIndex = -1;
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    if (item.type === 'custom_field' && item.input_type === 'page') {
      // We found a page - check if it's the page after which we want to insert
      if (usedToIndex === 0) {
        insertIndex = i;
        break;
      }
      usedToIndex--;
    }
  }

  // If we didn't find the insert index, it must be at the end of the array
  if (insertIndex === -1) {
    insertIndex = fields.length;
  }

  // Finally, insert the page we want to move into the new array at the desired index
  for (let i = pageStartIndex; i <= pageEndIndex; i++) {
    newArray.splice(insertIndex, 0, fields[i]);
    insertIndex++;
  }

  return newArray;
};

type MoveType = {
  fields: IFlatCustomField[];
  fromFieldIndex: number;
  toFieldIndex: number;
  fromPageIndex: number;
  toPageIndex: number;
  move: (indexA: number, indexB: number) => void;
};

export const moveField = ({
  fields,
  fromFieldIndex,
  toFieldIndex,
  toPageIndex,
  move,
}: MoveType) => {
  const elementBeingDragged = fields[fromFieldIndex];
  const nextPageIndex = fields.findIndex(
    (field, fieldIndex) => field.input_type === 'page' && fieldIndex !== 0
  );

  const toPageField = fields
    .filter((field) => field.input_type === 'page')
    .find((_page, pageIndex) => toPageIndex === pageIndex);
  const toPageFieldIndexFromFields = fields.findIndex(
    (field) => field.id === toPageField?.id
  );
  const hasMoreElements = fields.length > toPageFieldIndexFromFields + 1;
  const hasQuestions =
    hasMoreElements &&
    fields[toPageFieldIndexFromFields + 1].input_type !== 'page';

  if (!hasQuestions) {
    move(fromFieldIndex, toPageFieldIndexFromFields + 1);
    return;
  }

  if (fromFieldIndex === toFieldIndex) {
    move(fromFieldIndex, fromFieldIndex + 1);
    return;
  }

  const shouldMovePageToBeforeNextPage =
    fromFieldIndex === 0 &&
    elementBeingDragged.input_type === 'page' &&
    nextPageIndex > toFieldIndex;
  const shouldMovePageToNextPage =
    fromFieldIndex === 0 &&
    elementBeingDragged.input_type === 'page' &&
    nextPageIndex <= toFieldIndex;

  if (shouldMovePageToBeforeNextPage) {
    return;
  } else if (shouldMovePageToNextPage) {
    move(fromFieldIndex, toFieldIndex);
    move(nextPageIndex - 1, 0);
    return;
  }

  // Only pages should be draggable to index 0
  const shouldMove =
    elementBeingDragged.input_type === 'page' || toFieldIndex !== 0;

  if (shouldMove) {
    move(fromFieldIndex, toFieldIndex);
  }
};
