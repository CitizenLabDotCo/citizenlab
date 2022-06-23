import { omit } from 'lodash-es';
import { Series } from './typings';

const join = (data1: Series, data2: Series, { by }: { by: string }) => {
  const data2Map = toMap(data2, by);

  return data1.map((row) => {
    const byKey = row[by];
    const joinedRow = data2Map.get(byKey);

    return { ...row, ...omit(joinedRow, by) };
  });
};

const toMap = (data: Series, by: string) =>
  data.reduce((acc, curr) => {
    const byKey = curr[by];

    acc.set(byKey, curr);
    return acc;
  }, new Map());

export default join;
