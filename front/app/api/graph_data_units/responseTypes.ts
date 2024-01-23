import { SurveyResultAttributes } from 'api/survey_results/types';
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
  ReactionsCountRow,
  TimeSeriesResponseRow as ReactionsTimeSeriesResponseRow,
} from 'components/admin/GraphCards/ReactionsByTimeCard/useReactionsByTime/typings';
import {
  ActiveUsersRow,
  TimeSeriesResponseRow as UsersTimeSeriesResponseRow,
} from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget/useActiveUsers/typings';
import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

export type SurveyResultsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: SurveyResultAttributes;
  };
};

export type MostReactedIdeasResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      ideas: IIdeaData[];
      project: IProjectData;
      phase: IPhaseData;
      idea_images: IIdeaImageData[];
    };
  };
};

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

export type ReactionsByTimeResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      ReactionsTimeSeriesResponseRow[] | [],
      [ReactionsCountRow] | []
    ];
  };
};
