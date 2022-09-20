import { Response, EmptyResponse } from '.';

export const isEmptyResponse = (
  response: Response | EmptyResponse
): response is EmptyResponse => {
  const [feedbackRows, statusRows] = response.data;
  const feedbackRow = feedbackRows[0];

  return (
    Object.values(feedbackRow).every((value) => value === null) ||
    statusRows.length === 0
  );
};
