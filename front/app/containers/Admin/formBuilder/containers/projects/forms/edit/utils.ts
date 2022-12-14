import { questionDNDType } from 'containers/Admin/formBuilder/components/FormFields';
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

export type PageStructure = {
  questions: IFlatCustomField[];
  page: IFlatCustomField;
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

const getPageQuestions = (
  pages: PageStructure[],
  pageId: string
): IFlatCustomField[] => {
  const page = pages.find((page) => page.id === pageId) as PageStructure;
  return page.questions;
};

export const getReorderedFields = (
  result: DragAndDropResult,
  nestedPageData: PageStructure[]
): IFlatCustomField[] | undefined => {
  const { type, source, destination } = result;
  if (!destination) return;

  const sourcePageId = source.droppableId;
  const destinationPageId = destination.droppableId;

  if (type === questionDNDType) {
    if (sourcePageId === destinationPageId) {
      const updatedOrder = reorder<IFlatCustomField>(
        getPageQuestions(nestedPageData, sourcePageId),
        source.index,
        destination.index
      );
      const updatedPages = nestedPageData.map((field) =>
        field.id !== sourcePageId
          ? field
          : { ...field, questions: updatedOrder }
      );

      return getFlatPageStructure(updatedPages);
    } else {
      const sourceOrder = getPageQuestions(nestedPageData, sourcePageId);
      const destinationOrder = getPageQuestions(
        nestedPageData,
        destinationPageId
      );

      const [removed] = sourceOrder.splice(source.index, 1);
      destinationOrder.splice(destination.index, 0, removed);

      const updatedPages = nestedPageData.map((page) =>
        page.id === sourcePageId
          ? { ...page, questions: sourceOrder }
          : page.id === destinationPageId
          ? { ...page, questions: destinationOrder }
          : page
      );

      return getFlatPageStructure(updatedPages);
    }
  }

  const updatedPages = reorder<PageStructure>(
    nestedPageData,
    source.index,
    destination.index
  );

  return getFlatPageStructure(updatedPages);
};
