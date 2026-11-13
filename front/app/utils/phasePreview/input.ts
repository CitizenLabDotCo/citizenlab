import type { IIdeaData } from 'api/ideas/types';

import { JsonObject, object, PreviewSnapshot, relation } from './types';

export const createPreviewInput = (
  snapshot: PreviewSnapshot,
  body: JsonObject
) => {
  const actions = snapshot.phase.attributes.action_descriptors;
  const now = new Date().toISOString();

  return {
    id: `preview-${crypto.randomUUID()}`,
    type: 'idea',
    attributes: {
      slug: 'preview-input',
      title_multiloc: {},
      body_multiloc: {},
      custom_field_values: {},
      author_name: null,
      comments_count: 0,
      internal_comments_count: 0,
      official_feedbacks_count: 0,
      likes_count: 0,
      dislikes_count: 0,
      followers_count: 0,
      baskets_count: 0,
      votes_count: 0,
      manual_votes_amount: 0,
      total_votes: 0,
      location_point_geojson: null,
      location_description: null,
      budget: null,
      proposed_budget: null,
      anonymous: true,
      author_hash: 'preview',
      supports_public_visibility:
        snapshot.phase.attributes.supports_public_visibility,
      publication_status: 'published',
      action_descriptors: {
        reacting_idea: {
          ...actions.reacting_idea,
          cancelling_enabled: true,
          up: { ...actions.reacting_idea.up, future_enabled_at: null },
          down: { ...actions.reacting_idea.down, future_enabled_at: null },
        },
        commenting_idea: {
          ...actions.commenting_idea,
          future_enabled_at: null,
        },
        comment_reacting_idea: {
          ...actions.comment_reacting_idea,
          future_enabled_at: null,
        },
        editing_idea: {
          enabled: false,
          disabled_reason: 'not_author',
          future_enabled_at: null,
        },
      },
      created_at: now,
      updated_at: now,
      published_at: now,
      ...object(body.idea),
    },
    relationships: {
      author: { data: null },
      idea_status: { data: null },
      user_follower: { data: null },
      user_reaction: { data: null },
      ideas_phases: { data: [] },
      project: relation(snapshot.project.id, 'project'),
      creation_phase: relation(snapshot.phase.id, 'phase'),
      phases: { data: [{ id: snapshot.phase.id, type: 'phase' }] },
      idea_images: { data: [] },
      idea_files: { data: [] },
      input_topics: { data: [] },
    },
  } satisfies IIdeaData & {
    attributes: { custom_field_values: JsonObject };
    relationships: { idea_files: { data: { id: string; type: string }[] } };
  };
};
