import messages from '../messages';

// "Status is Live", "Status is any of Live, Draft".
export const getListOperator = (pickedCount: number) =>
  pickedCount > 1 ? messages.isAnyOf : messages.is;

// "is between 1 Jan and 1 Mar", "is after 1 Jan", "is before 1 Mar".
export const getDateOperator = (from?: string, to?: string) => {
  if (from && to) return messages.isBetween;
  return from ? messages.isAfter : messages.isBefore;
};
