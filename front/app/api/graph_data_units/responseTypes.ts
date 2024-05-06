import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import {
  ActiveUsersRow,
  TimeSeriesResponseRow as UsersTimeSeriesResponseRow,
} from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget/useActiveUsers/typings';
import {
  TotalsRow as VisitorsTotalsRow,
  TimeSeriesResponseRow as VisitorsTimeSeriesResponseRow,
} from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/VisitorsWidget/useVisitors/typings';

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
import { TrafficSourcesRow } from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes/typings';

// Survey question results
export type SurveyQuestionResultResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: ResultGrouped | ResultUngrouped;
  };
};

export type MostReactedIdeasResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      ideas: IIdeaData[];
      project: IProjectData;
      phase: IPhaseData;
      idea_images: Record<string, IIdeaImageData[]>;
    };
  };
};

export type SingleIdeaResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      idea: IIdeaData;
      idea_images: IIdeaImageData[];
    };
  };
};

export type VisitorsResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: [
      [VisitorsTotalsRow] | [],
      VisitorsTimeSeriesResponseRow[] | []
    ];
  };
};

export interface VisitorsTrafficSourcesResponse {
  data: {
    type: 'report_builder_data_units';
    attributes: TrafficSourcesRow[];
  };
}

export type GenderOption = 'male' | 'female' | 'unspecified' | '_blank';

export type UsersByGenderResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      [key in GenderOption]: number;
    };
  };
};

export type UsersByAgeResponse = {
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
