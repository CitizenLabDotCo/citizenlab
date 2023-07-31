import { omitBy, isNil } from 'lodash-es';
import { State, IParticipationContextConfig } from '..';

export default ({
  participation_method,
  posting_enabled,
  commenting_enabled,
  reacting_enabled,
  reacting_like_method,
  reacting_dislike_method,
  allow_anonymous_participation,
  reacting_like_limited_max,
  reacting_dislike_limited_max,
  reacting_dislike_enabled,
  presentation_mode,
  voting_method,
  voting_min_total,
  voting_max_total,
  survey_embed_url,
  voting_max_votes_per_idea,
  voting_term_singular_multiloc,
  voting_term_plural_multiloc,
  survey_service,
  poll_anonymous,
  ideas_order,
  input_term,
  document_annotation_embed_url,
}: State) => {
  let output: IParticipationContextConfig = {} as any;

  if (participation_method === 'information') {
    output = {
      participation_method,
    };
  } else if (
    participation_method === 'ideation' ||
    participation_method === 'native_survey'
  ) {
    output = omitBy(
      {
        participation_method,
        posting_enabled,
        commenting_enabled,
        reacting_enabled,
        reacting_like_method,
        reacting_like_limited_max,
        reacting_dislike_enabled,
        allow_anonymous_participation,
        reacting_dislike_method,
        reacting_dislike_limited_max,
        presentation_mode,
        ideas_order,
        input_term,
      },
      isNil
    ) as IParticipationContextConfig;
  } else if (participation_method === 'survey') {
    output = {
      participation_method,
      survey_embed_url,
      survey_service,
    };
  } else if (participation_method === 'document_annotation') {
    output = {
      participation_method,
      document_annotation_embed_url,
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
  } else if (participation_method === 'voting') {
    output = omitBy(
      {
        participation_method,
        voting_min_total,
        voting_max_votes_per_idea,
        voting_term_singular_multiloc,
        voting_term_plural_multiloc,
        commenting_enabled,
        presentation_mode,
        ideas_order,
        input_term,
        voting_method,
      },
      isNil
    ) as IParticipationContextConfig;
    output.voting_max_total = voting_max_total;
  }

  return output;
};
