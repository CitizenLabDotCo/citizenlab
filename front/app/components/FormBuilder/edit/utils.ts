import { questionDNDType } from 'components/FormBuilder/components/FormFields';
import { IFlatCustomField } from 'api/custom_fields/types';

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
