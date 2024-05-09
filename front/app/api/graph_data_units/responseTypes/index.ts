import {
  ReactionsCountRow,
  TimeSeriesResponseRow as ReactionsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/typings';

export type ReactionsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      ReactionsTimeSeriesResponseRow[] | [],
      [ReactionsCountRow] | []
    ];
  };
};
