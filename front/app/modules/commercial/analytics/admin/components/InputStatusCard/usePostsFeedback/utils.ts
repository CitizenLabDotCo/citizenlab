import { Response, EmptyResponse } from './typings';

export const isEmptyResponse = (
  response: Response | EmptyResponse
): response is EmptyResponse => {
  const [feedbackRows, statusRows] = response.data.attributes;
  const feedbackRow = feedbackRows[0];

  return (
    Object.values(feedbackRow).every((value) => value === null) ||
    statusRows.length === 0
  );
};
