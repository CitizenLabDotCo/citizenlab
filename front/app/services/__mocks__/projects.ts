import { ProcessType, IProjectData } from 'services/projects';
import {
  ParticipationMethod,
  SurveyServices,
} from 'services/participationContexts';

export function getProject(
  id: string,
  processType: ProcessType,
  participationMethod?: ParticipationMethod,
  surveyService?: SurveyServices
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
        small: `header${id}ImageUrlSmall`,
        medium: `header${id}ImageUrlMedium`,
        large: `header${id}ImageUrlLarge`,
        fb: `header${id}ImageUrlFb`,
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
      voting_enabled: true,
      voting_method: 'unlimited', // 'limited' | 'unlimited',
      voting_limited_max: 0,
      downvoting_enabled: true,
      presentation_mode: 'card', // PresentationMode = 'map' | 'card' cf real project.ts
      internal_role: null, // 'open_idea_box' | null,
      publication_status: 'published', // PublicationStatus = 'draft' | 'published' | 'archived' cf real project.ts
      // max_budget?: number,
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
        voting_idea: {
          enabled: true,
          disabled_reason: null,
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
  } as IProjectData;
}
