import { ProcessType } from 'services/projects';
import { ParticipationMethod, SurveyServices } from 'services/participationContexts';

export const getProject = (id: string, processType: ProcessType, participationMethod?: ParticipationMethod, surveyService?: SurveyServices) => ({
  id,
  type: 'projects',
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
    participation_method: participationMethod || null,
    posting_enabled: true,
    commenting_enabled: true,
    voting_enabled: true,
    voting_method: 'unlimited', // 'limited' | 'unlimited',
    voting_limited_max: 0,
    presentation_mode: 'card', // PresentationMode = 'map' | 'card' cf real project.ts
    internal_role: null, // 'open_idea_box' | null,
    publication_status: 'published', // PublicationStatus = 'draft' | 'published' | 'archived' cf real project.ts
    // max_budget?: number,
    survey_service: surveyService,
    survey_embed_url: `mockProject${id}${surveyService}Url`,
    ordering: 0,
    action_descriptor: {
      posting: {
        enabled: true,
        future_enabled: null, // string | null,
        disabled_reason: null // PostingDisabledReasons | null,
      },
      commenting: {
        enabled: true,
        disabled_reason: null,
      },
      voting: {
        enabled: true,
        disabled_reason: null,
      },
      taking_survey: {
        enabled: true,
        disabled_reason: null // SurveyDisabledReasons | null,
      },
      taking_poll: {
        enabled: true,
        disabled_reason: null // SurveyDisabledReasons | null,
      }
    }
  },
  relationships: {
    project_images: {
      data: []// IRelationship[]
    },
    areas: {
      data: []// IRelationship[]
    },
    avatars : {
      data: []// IRelationship[]
    },
    current_phase: {
      data: null
    },
    user_basket: {
      data: null // IRelationship | null,
    }
  },
});
