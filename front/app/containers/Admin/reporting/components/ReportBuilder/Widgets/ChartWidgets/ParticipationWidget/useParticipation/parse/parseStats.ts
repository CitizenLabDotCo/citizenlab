import {
  ParticipationResponse,
  TimeSeriesResponseRow,
  BaseRow,
} from 'api/graph_data_units/responseTypes/ParticipationWidget';

export const parseStats = ([
  inputsTimeSeries,
  commentsTimeSeries,
  votesTimeSeries,
  inputsComparedPeriod,
  commentsComparedPeriod,
  votesComparedPeriod,
]: ParticipationResponse['data']['attributes']) => {
  const sumInputs = sumTimeSeries(inputsTimeSeries);
  const sumComments = sumTimeSeries(commentsTimeSeries);
  const sumVotes = sumTimeSeries(votesTimeSeries);

  const inputsDelta = getDelta(sumInputs, inputsComparedPeriod);
  const commentsDelta = getDelta(sumComments, commentsComparedPeriod);
  const votesDelta = getDelta(sumVotes, votesComparedPeriod);

  return {
    inputs: {
      value: sumInputs,
      delta: inputsDelta,
    },
    comments: {
      value: sumComments,
      delta: commentsDelta,
    },
    votes: {
      value: sumVotes,
      delta: votesDelta,
    },
  };
};

const sumTimeSeries = (timeSeries: TimeSeriesResponseRow[]) => {
  return timeSeries.reduce((acc, { count }) => acc + count, 0);
};

const getDelta = (total: number, previousRow?: [BaseRow] | []) => {
  if (previousRow === undefined) {
    return undefined;
  }

  const previousValue = previousRow[0]?.count ?? 0;
  return total - previousValue;
};
