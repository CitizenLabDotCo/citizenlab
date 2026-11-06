import { Multiloc } from 'typings';

import { Visibility } from 'api/projects/types';

export type UpdateProjectArguments = {
  title_multiloc?: Multiloc;
  description_preview_multiloc?: Multiloc;
  visible_to?: Visibility;
  group_ids?: string[];
  area_ids?: string[];
  global_topic_ids?: string[];
  include_all_areas?: boolean;
  listed?: boolean;
  live_auto_input_topics_enabled?: boolean;
  track_participation_location?: boolean;
};
