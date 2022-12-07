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

  let pageStartIndex = fields.findIndex((field) => {
    if (field.input_type === 'page') {
      if (usedFromIndex === 0) {
        return true;
      }
      usedFromIndex--;
    }
    return false;
  });

  if (pageStartIndex === -1) {
    return fields;
  }

  let pageEndIndex = -1;
  for (let i = pageStartIndex + 1; i < fields.length; i++) {
    const item = fields[i];
    if (item.input_type === 'page') {
      // We found another page, so the previous page must have ended
      pageEndIndex = i - 1;
      break;
    }
  }

  // If we didn't find the end of the page, it must be the last item in the array
  if (pageEndIndex === -1) {
    pageEndIndex = fields.length - 1;
  }

  const result = [...fields];
  result.splice(pageStartIndex, pageEndIndex - pageStartIndex + 1);

  let insertIndex = fields.findIndex((field) => {
    if (field.input_type === 'page') {
      if (usedToIndex === 0) {
        return true;
      }
      usedToIndex--;
    }
    return false;
  });

  if (insertIndex === -1) {
    insertIndex = fields.length;
  }

  result.splice(
    insertIndex,
    0,
    ...fields.slice(pageStartIndex, pageEndIndex + 1)
  );
  return result;
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
