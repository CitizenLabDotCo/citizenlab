import { IProjectData } from 'api/projects/types';

export const project: IProjectData = {
  id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
  type: 'project',
  attributes: {
    followers_count: 2,
    description_preview_multiloc: {
      en: 'You can propose anywhere you like, but we will only accept Koekenbakstraat',
    },
    title_multiloc: {
      en: 'Choose where to plant the tree',
      'de-DE': 'Sheisse',
      'es-CL': 'Renewing River Park',
      'fr-BE': "Choisissez ou planter l'arbre",
      'nl-BE': 'Kies waar de boom te planten',
    },
    comments_count: 1,
    ideas_count: 5,
    include_all_areas: false,
    internal_role: null,
    slug: 'choose-where-to-plant-the-tree',
    visible_to: 'public',
    created_at: '2019-05-11T17:04:13.090Z',
    first_published_at: '2019-05-11T17:04:13.090Z',
    updated_at: '2023-03-22T08:36:22.662Z',
    folder_id: null,
    publication_status: 'published',
    description_multiloc: {
      en: '<p>You can propose anywhere you like, but we will only accept Koekenbakstraat</p>',
    },
    header_bg: {
      large:
        'https://demo.stg.govocal.com/uploads/c7e20cb9-f253-4c0c-aea1-e6e3c23c04c7/project/header_bg/be3f645b-3e1d-4afc-b91b-d68c4dc0100b/large_header_bg.jpeg',
    },
    header_bg_alt_text_multiloc: {},
    action_descriptors: {
      posting_idea: {
        enabled: true,
        disabled_reason: null,
        future_enabled_at: null,
      },
      commenting_idea: {
        enabled: true,
        disabled_reason: null,
      },
      comment_reacting_idea: {
        enabled: true,
        disabled_reason: null,
      },
      reacting_idea: {
        enabled: true,
        disabled_reason: null,
        up: {
          enabled: true,
          disabled_reason: null,
        },
        down: {
          enabled: false,
          disabled_reason: 'reacting_dislike_disabled',
        },
      },
      voting: {
        enabled: false,
        disabled_reason: 'not_voting',
      },
      taking_survey: {
        enabled: false,
        disabled_reason: 'not_survey',
      },
      taking_poll: {
        enabled: false,
        disabled_reason: 'not_poll',
      },
      annotating_document: {
        enabled: false,
        disabled_reason: 'not_document_annotation',
      },
      attending_event: {
        enabled: true,
        disabled_reason: null,
      },
      volunteering: {
        enabled: false,
        disabled_reason: 'not_volunteering',
      },
    },
    avatars_count: 8,
    participants_count: 8,
    uses_content_builder: false,
    preview_token: 'fake-token-0123456789',
    baskets_count: 0,
    votes_count: 0,
  },
  relationships: {
    admin_publication: {
      data: {
        id: 'bf9f26f1-678a-4af0-993c-cb1ebacca7f4',
        type: 'admin_publication',
      },
    },
    current_phase: {
      data: {
        id: '123',
        type: 'phase',
      },
    },
    project_images: {
      data: [
        {
          id: '552492c7-488a-4774-8577-7566f3a52eb0',
          type: 'project_image',
        },
      ],
    },
    areas: {
      data: [],
    },
    topics: {
      data: [],
    },
    avatars: {
      data: [
        {
          id: '867affc5-9356-4f71-b64f-6ae219595681',
          type: 'avatar',
        },
        {
          id: '231c73b0-c14d-48ce-9d9b-d24a76201ec7',
          type: 'avatar',
        },
        {
          id: '77ed1d53-5a50-4fdc-918a-c3df01aa46b1',
          type: 'avatar',
        },
      ],
    },
    user_basket: {
      data: null,
    },
    user_follower: {
      data: null,
    },
    default_assignee: {
      data: null,
    },
  },
};
