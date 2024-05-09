import {
  InputsCountRow,
  TimeSeriesResponseRow as PostsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/typings';
import {
  ReactionsCountRow,
  TimeSeriesResponseRow as ReactionsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/typings';

export type PostsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [PostsTimeSeriesResponseRow[] | [], [InputsCountRow] | []];
  };
};

export type ReactionsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      ReactionsTimeSeriesResponseRow[] | [],
      [ReactionsCountRow] | []
    ];
  };
};
