import { GenderOption } from 'api/users_by_gender/types';
import {
  CommentsCountRow,
  TimeSeriesResponseRow as CommentsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/CommentsByTimeCard/useCommentsByTime/typings';
import {
  InputsCountRow,
  TimeSeriesResponseRow as PostsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime/typings';
import {
  ActiveUsersRow,
  TimeSeriesResponseRow as UsersTimeSeriesResponseRow,
} from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget/useActiveUsers/typings';

export type UsersByGenderResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
};

export type UsersByBirthyearResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key: string]: number;
    };
  };
};

export interface ActiveUsersResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: [UsersTimeSeriesResponseRow[] | [], [ActiveUsersRow] | []];
  };
}

export type PostsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [PostsTimeSeriesResponseRow[] | [], [InputsCountRow] | []];
  };
};

export type CommentsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [CommentsTimeSeriesResponseRow[] | [], [CommentsCountRow] | []];
  };
};
