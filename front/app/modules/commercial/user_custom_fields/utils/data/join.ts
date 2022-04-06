import { omit } from 'lodash-es';

type Data = Record<string, any>[];

const join = (data1: Data, data2: Data, { by }: { by: string }) => {
  const data2Map = toMap(data2, by);

  return data1.map((row) => {
    const byKey = row[by];
    const joinedRow = data2Map.get(byKey);

    return { ...row, ...omit(joinedRow, by) };
  });
};

const toMap = (data: Data, by: string) =>
  data.reduce((acc, curr) => {
    const byKey = curr[by];

    acc.set(byKey, curr);
    return acc;
  }, new Map());

export default join;
