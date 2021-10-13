import { omitBy, isNil } from 'lodash-es';
import { State, IParticipationContextConfig } from '..';

export default ({
  participation_method,
  posting_enabled,
  commenting_enabled,
  voting_enabled,
  upvoting_method,
  downvoting_method,
  upvoting_limited_max,
  downvoting_limited_max,
  downvoting_enabled,
  presentation_mode,
  min_budget,
  max_budget,
  survey_embed_url,
  survey_service,
  poll_anonymous,
  ideas_order,
  input_term,
}: State) => {
  let output: IParticipationContextConfig = {} as any;

  if (participation_method === 'information') {
    output = {
      participation_method,
    };
  } else if (participation_method === 'ideation') {
    output = omitBy(
      {
        participation_method,
        posting_enabled,
        commenting_enabled,
        voting_enabled,
        presentation_mode,
        ideas_order,
        input_term,
        upvoting_method: voting_enabled ? upvoting_method : null,
        downvoting_method: voting_enabled ? downvoting_method : null,
        upvoting_limited_max:
          voting_enabled && upvoting_method === 'limited'
            ? upvoting_limited_max
            : null,
        downvoting_limited_max:
          voting_enabled && downvoting_method === 'limited'
            ? downvoting_limited_max
            : null,
        downvoting_enabled: voting_enabled ? downvoting_enabled : null,
      },
      isNil
    ) as IParticipationContextConfig;
  } else if (participation_method === 'survey') {
    output = {
      participation_method,
      survey_embed_url,
      survey_service,
    };
  } else if (participation_method === 'poll') {
    output = {
      participation_method,
      poll_anonymous,
    };
  } else if (participation_method === 'volunteering') {
    output = {
      participation_method,
    };
  } else if (participation_method === 'budgeting') {
    output = omitBy(
      {
        participation_method,
        min_budget,
        max_budget,
        commenting_enabled,
        presentation_mode,
        ideas_order,
        input_term,
      },
      isNil
    ) as IParticipationContextConfig;
  }

  return output;
};
