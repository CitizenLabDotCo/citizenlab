import { IFlatCustomField } from 'services/formCustomFields';

export const movePageWithQuestions = (
  fields: IFlatCustomField[],
  fromIndex: number,
  toIndex: number
) => {
  console.log('fromIndex- Page', fromIndex);
  console.log('toIndex- Page', toIndex);
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
  nextFieldId: string;
  move: (indexA: number, indexB: number) => void;
};

export const moveField = ({
  fields,
  fromFieldIndex,
  toFieldIndex,
  toPageIndex,
  move,
  nextFieldId,
}: MoveType) => {
  /*
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
  */
  // console.log('fromFieldIndex', fromFieldIndex);
  // console.log('toFieldIndex', toFieldIndex);
  // console.log('toPageIndex', toPageIndex);
  // console.log('nextFieldId', nextFieldId);

  // const elementWithNextFieldId = fields.find((field) => field.id === nextFieldId);
  const elementWithNextFieldId = fields.find(
    (field) => field.key === nextFieldId
  );
  // console.log('elementWithNextFieldId', elementWithNextFieldId);
  console.log('fields', fields);

  // if (fromFieldIndex === toFieldIndex) {
  //   move(fromFieldIndex, elementWithNextFieldId);
  //   return;
  // }

  move(fromFieldIndex, toFieldIndex);
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export type PageStructure = {
  questions: IFlatCustomField[];
  page: IFlatCustomField;
  id: string;
};

const flattenPageStructure = (
  nestedPageStructure: PageStructure[]
): IFlatCustomField[] => {
  const flattenedPageStructure: IFlatCustomField[] = [];
  nestedPageStructure.forEach((page) => {
    flattenedPageStructure.push(page.page);
    page.questions.forEach((question) => {
      flattenedPageStructure.push(question);
    });
  });
  return flattenedPageStructure;
};

const getPageQuestions = (pages: PageStructure[], pageId: string) => {
  return pages.find((page) => page.id === pageId).questions;
};

export const reorderFields = (
  result,
  nestedPageData: PageStructure[],
  replace
) => {
  const { type, source, destination } = result;
  if (!destination) return;

  const sourcePageId = source.droppableId;
  const destinationPageId = destination.droppableId;

  // Reordering questions
  if (type === 'droppable-question') {
    // If drag and dropping within the same field
    if (sourcePageId === destinationPageId) {
      const updatedOrder = reorder(
        getPageQuestions(nestedPageData, sourcePageId),
        source.index,
        destination.index
      );
      const updatedPages = nestedPageData.map((field) =>
        field.id !== sourcePageId
          ? field
          : { ...field, questions: updatedOrder }
      );

      replace(flattenPageStructure(updatedPages));
    } else {
      const sourceOrder = getPageQuestions(nestedPageData, sourcePageId);
      const destinationOrder = getPageQuestions(
        nestedPageData,
        destinationPageId
      );

      const [removed] = sourceOrder.splice(source.index, 1);
      destinationOrder.splice(destination.index, 0, removed);

      destinationOrder[removed] = sourceOrder[removed];
      delete sourceOrder[removed];

      const updatedCategories = nestedPageData.map((page) =>
        page.id === sourcePageId
          ? { ...page, questions: sourceOrder }
          : page.id === destinationPageId
          ? { ...page, questions: destinationOrder }
          : page
      );

      replace(flattenPageStructure(updatedCategories));
    }
  }

  // Reordering fields
  if (type === 'droppable-page') {
    const updatedCategories = reorder(
      nestedPageData,
      source.index,
      destination.index
    );

    replace(flattenPageStructure(updatedCategories));
  }
};
