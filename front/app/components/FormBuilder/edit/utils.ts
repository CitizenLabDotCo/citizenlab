import { questionDNDType } from 'components/FormBuilder/components/FormFields';
import { IFlatCustomField } from 'services/formCustomFields';

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

const getFlatPageStructure = (
  nestedPageStructure: NestedGroupingStructure[]
): IFlatCustomField[] => {
  const flattenedPageStructure: IFlatCustomField[] = [];
  nestedPageStructure.forEach((page) => {
    flattenedPageStructure.push(page.groupElement);
    page.questions.forEach((question) => {
      flattenedPageStructure.push(question);
    });
  });
  return flattenedPageStructure;
};

const getPageQuestions = (
  pages: NestedGroupingStructure[],
  pageId: string
): IFlatCustomField[] => {
  const page = pages.find(
    (page) => page.id === pageId
  ) as NestedGroupingStructure;
  return page.questions;
};

export const getReorderedFields = (
  result: DragAndDropResult,
  nestedGroupData: NestedGroupingStructure[]
): IFlatCustomField[] | undefined => {
  const { type, source, destination } = result;
  if (!destination) return;

  const sourcePageId = source.droppableId;
  const destinationPageId = destination.droppableId;

  if (type === questionDNDType) {
    if (sourcePageId === destinationPageId) {
      const updatedOrder = reorder<IFlatCustomField>(
        getPageQuestions(nestedGroupData, sourcePageId),
        source.index,
        destination.index
      );
      const updatedPages = nestedGroupData.map((field) =>
        field.id !== sourcePageId
          ? field
          : { ...field, questions: updatedOrder }
      );

      return getFlatPageStructure(updatedPages);
    } else {
      const sourceOrder = getPageQuestions(nestedGroupData, sourcePageId);
      const destinationOrder = getPageQuestions(
        nestedGroupData,
        destinationPageId
      );

      const [removed] = sourceOrder.splice(source.index, 1);
      destinationOrder.splice(destination.index, 0, removed);

      const updatedPages = nestedGroupData.map((page) =>
        page.id === sourcePageId
          ? { ...page, questions: sourceOrder }
          : page.id === destinationPageId
          ? { ...page, questions: destinationOrder }
          : page
      );

      return getFlatPageStructure(updatedPages);
    }
  }

  const updatedPages = reorder<NestedGroupingStructure>(
    nestedGroupData,
    source.index,
    destination.index
  );

  return getFlatPageStructure(updatedPages);
};
