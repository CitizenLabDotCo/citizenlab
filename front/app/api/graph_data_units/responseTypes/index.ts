import { IIdeaImageData } from 'api/idea_images/types';
import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

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
