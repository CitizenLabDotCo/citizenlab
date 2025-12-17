import { Mapping, Payload } from './typings';

export const convertData = <Row>(
  data: Row[],
  mapping: Mapping<Row>
): Payload<Row>[] => {
  return data.map((row, rowIndex) => {
    const category = row[mapping.category] as string;
    const primaryValue = row[mapping.primaryValue] as number;
    const comparisonValue = mapping.comparisonValue
      ? (row[mapping.comparisonValue] as number | undefined)
      : undefined;
    const count = mapping.count
      ? (row[mapping.count] as number | undefined)
      : undefined;

    return {
      row,
      rowIndex,
      category,
      primaryValue,
      comparisonValue,
      count,
    };
  });
};

export const getBarFill = <Row>(
  payload: Payload<Row>,
  mapping: Mapping<Row>,
  defaultColor: string
): string => {
  if (mapping.fill) {
    return mapping.fill(payload);
  }
  return defaultColor;
};

export const getBarOpacity = <Row>(
  payload: Payload<Row>,
  mapping: Mapping<Row>
): number => {
  if (mapping.opacity) {
    return mapping.opacity(payload);
  }
  return 1;
};
