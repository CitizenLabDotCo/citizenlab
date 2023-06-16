import { ProcessType, IProjectData } from '../types';
import {
  ParticipationMethod,
  TSurveyService,
} from 'services/participationContexts';

export function getProject(
  id: string,
  processType: ProcessType,
  participationMethod?: ParticipationMethod,
  surveyService?: TSurveyService
) {
  return {
    id,
    type: 'project',
    attributes: {
      title_multiloc: { en: `${id} project Title` },
      description_multiloc: { en: `${id} project description` },
      description_preview_multiloc: { en: `${id} project description preview` },
      slug: `${id}_slug`,
      input_term: 'idea',
      header_bg: {
        large: `header${id}ImageUrlLarge`,
      }, // ImageSizes,
      ideas_count: 25,
      comments_count: 10,
      avatars_count: 23,
      created_at: 'yesterday',
      updated_at: 'yesterday but later', // should be a real time string
      visible_to: 'public', // 'public' | 'groups' | 'admins' cf real project.ts
      process_type: processType,
      timeline_active: 'present',
      participants_count: 13,
      participation_method: participationMethod || null,
      posting_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'unlimited', // 'limited' | 'unlimited',
      reacting_like_limited_max: 0,
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited', // 'limited' | 'unlimited',
      reacting_dislike_limited_max: 0,
      presentation_mode: 'card', // PresentationMode = 'map' | 'card' cf real project.ts
      internal_role: null, // 'open_idea_box' | null,
      publication_status: 'published', // PublicationStatus = 'draft' | 'published' | 'archived' cf real project.ts
      survey_service: surveyService,
      survey_embed_url: `mockProject${id}${surveyService}Url`,
      ordering: 0,
      action_descriptor: {
        posting_idea: {
          enabled: true,
          future_enabled: null, // string | null,
          disabled_reason: null, // PostingDisabledReasons | null,
        },
        commenting_idea: {
          enabled: true,
          disabled_reason: null,
        },
        reacting_idea: {
          up: {
            enabled: true,
            disabled_reason: null,
          },
          down: {
            enabled: true,
            disabled_reason: null,
          },
        },
        taking_survey: {
          enabled: true,
          disabled_reason: null, // SurveyDisabledReasons | null,
        },
        taking_poll: {
          enabled: true,
          disabled_reason: null, // SurveyDisabledReasons | null,
        },
      },
    },
    relationships: {
      project_images: {
        data: [
          {
            id: 'ac9775d9-4547-4213-af6c-ef4f3b4e3fac',
            type: 'image',
          },
        ], // IRelationship[]
      },
      areas: {
        data: [
          {
            id: '48413049-7286-42a4-9f53-884d10e97d2c',
            type: 'area',
          },
        ], // IRelationship[]
      },
      current_phase: {
        data: null,
      },
      user_basket: {
        data: null, // IRelationship | null,
      },
    },
  } as unknown as IProjectData;
}
