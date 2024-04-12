import { IUserCustomFieldData } from 'api/user_custom_fields/types';

export const isShown = ({
  attributes: { input_type, code, enabled },
}: IUserCustomFieldData) => {
  return (input_type === 'select' || code === 'birthyear') && enabled;
};

export const isSupported = ({
  attributes: { input_type, code },
}: IUserCustomFieldData) => input_type === 'select' || code === 'birthyear';

export const hasReferenceData = ({ relationships }: IUserCustomFieldData) =>
  !!relationships?.current_ref_distribution.data;

export const sortUserCustomFields = (
  userCustomFields: IUserCustomFieldData[]
) => {
  const indexById = userCustomFields.reduce(
    (acc, userCustomField, i) => ({
      ...acc,
      [userCustomField.id]: i,
    }),
    {}
  );

  const cloned = [...userCustomFields];

  const compareFunction = (
    a: IUserCustomFieldData,
    b: IUserCustomFieldData
  ) => {
    // negative = a earlier in array than b
    const compareHasReferenceData = compareOnCondition(
      a,
      b,
      hasReferenceData,
      indexById
    );
    if (compareHasReferenceData !== 0) return compareHasReferenceData;

    const compareIsSupported = compareOnCondition(a, b, isSupported, indexById);
    if (compareIsSupported !== 0) return compareIsSupported;

    return compareByIndex(a, b, indexById);
  };

  return cloned.sort(compareFunction);
};

const compareOnCondition = (
  a: IUserCustomFieldData,
  b: IUserCustomFieldData,
  condition: (userCustomField: IUserCustomFieldData) => boolean,
  indexById: Record<string, number>
) => {
  const aCondition = condition(a);
  const bCondition = condition(b);

  if (aCondition && !bCondition) return -1;
  if (!aCondition && bCondition) return 1;

  if (aCondition && bCondition) {
    return compareByIndex(a, b, indexById);
  }

  return 0;
};

const compareByIndex = (
  a: IUserCustomFieldData,
  b: IUserCustomFieldData,
  indexById: Record<string, number>
) => indexById[a.id] - indexById[b.id];
