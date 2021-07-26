def create_for_current_locales
  translations = {}
  AppConfiguration.instance.settings.dig('core', 'locales').each { |locale| translations[locale] = yield }
  translations
end

# Adds a list of common passwords.
CommonPassword.initialize!

# Configure your app here.
AppConfiguration.create!(
  name: 'local',
  host: ENV.fetch('CL_SETTINGS_HOST'),
  settings: {
    core: {
      allowed: true,
      enabled: true,
      locales: [ENV.fetch('CL_SETTINGS_CORE_LOCALES_0', 'en')],
      organization_type: 'small_city',
      organization_name: {
        'en' => Faker::Address.city,
      },
      timezone: ENV.fetch('CL_SETTINGS_CORE_TIMEZONE', 'Brussels'),
      currency: ENV.fetch('CL_SETTINGS_CORE_CURRENCY', 'EUR'),
      color_main: '#163A7D',
      color_secondary: '#CF4040',
      color_text: '#163A7D',
      reply_to_email: ENV.fetch('DEFAULT_FROM_EMAIL')
    },
    password_login: {
      enabled: true,
      allowed: true
    },
    facebook_login: {
      enabled: ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_ENABLED', 'false') == 'true',
      allowed: true,
      app_id: ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_ID', nil),
      app_secret: ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_SECRET', nil)
    }.compact,
    google_login: {
      enabled: ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_ENABLED', 'false') == 'true',
      allowed: true,
      client_id: ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_ID', nil),
      client_secret: ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_SECRET', nil)
    }.compact,
    maps: {
      enabled: true,
      allowed: true,
      map_center: {
        lat: ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LAT', '50.8503'),
        long: ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LONG', '4.3517')
      },
      zoom_level: ENV.fetch('CL_SETTINGS_MAPS_ZOOM_LEVEL', '12')&.to_i
    },
    participatory_budgeting: {
      enabled: true,
      allowed: true
    },
    polls: {
      enabled: true,
      allowed: true
    },
    initiatives: {
      enabled: true,
      allowed: true,
      voting_threshold: 300,
      days_limit: 90,
      threshold_reached_message: MultilocService.new.i18n_to_multiloc('initiatives.default_threshold_reached_message', locales: CL2_SUPPORTED_LOCALES),
      eligibility_criteria: MultilocService.new.i18n_to_multiloc('initiatives.default_eligibility_criteria', locales: CL2_SUPPORTED_LOCALES),
      success_stories: []
    },
    surveys: {
      enabled: true,
      allowed: true
    },
    typeform_surveys: {
      enabled: true,
      allowed: true,
    },
    google_forms_surveys: {
      enabled: true,
      allowed: true
    },
    enalyzer_surveys: {
      enabled: true,
      allowed: true
    },
    survey_xact_surveys: {
      enabled: true,
      allowed: true
    },
    qualtrics_surveys: {
      enabled: true,
      allowed: true
    },
    surveymonkey_surveys: {
      enabled: true,
      allowed: true
    },
    volunteering: {
      enabled: true,
      allowed: true
    },
    workshops: {
      enabled: false,
      allowed: false
    },
    ideas_overview: {
      enabled: false,
      allowed: false
    },
    disable_downvoting: {
      enabled: false,
      allowed: true
    },
    ideaflow_social_sharing: {
      enabled: true,
      allowed: true
    },
    initiativeflow_social_sharing: {
      enabled: true,
      allowed: true
    },
    widgets: {
      enabled: false,
      allowed: false
    },
    manual_emailing: {
      enabled: true,
      allowed: true
    },
    automated_emailing_control: {
      enabled: true,
      allowed: true
    },
    pages: {
      enabled: true,
      allowed: true
    },
    redirects: {
      enabled: false,
      allowed: true,
    },
    idea_custom_copy: {
      enabled: false,
      allowed: true
    },
    private_projects: {
      enabled: true,
      allowed: true
    },
    project_visibility: {
      enabled: true,
      allowed: true
    },
    events_page: {
      enabled: true,
      allowed: true
    },
    events_widget: {
      enabled: true,
      allowed: true
    }
  }
)

# Creates a default admin account.
User.create!(
  email: ENV.fetch('INITIAL_ADMIN_EMAIL'),
  password: ENV.fetch('INITIAL_ADMIN_PASSWORD'),
  first_name: ENV.fetch('INITIAL_ADMIN_FIRST_NAME'),
  last_name: ENV.fetch('INITIAL_ADMIN_LAST_NAME'),
  roles: [
    {type: 'admin'},
  ],
  locale: ENV.fetch('CL_SETTINGS_CORE_LOCALES_0', 'en'),
  registration_completed_at: Time.now
)

# Creates idea statuses.
[
  {
    title_multiloc: 'idea_statuses.proposed',
    ordering: 100,
    code: 'proposed',
    color: '#687782',
    description_multiloc: 'idea_statuses.proposed_description'
  },
  {
    title_multiloc: 'idea_statuses.viewed',
    ordering: 150,
    code: 'viewed',
    color: '#01A1B1',
    description_multiloc: 'idea_statuses.viewed_description'
  },
  {
    title_multiloc: 'idea_statuses.under_consideration',
    ordering: 200,
    code: 'under_consideration',
    color: '#0080A5',
    description_multiloc: 'idea_statuses.under_consideration_description'
  },
  {
    title_multiloc: 'idea_statuses.accepted',
    ordering: 300,
    code: 'accepted',
    color: '#04884C',
    description_multiloc: 'idea_statuses.accepted_description'
  },
  {
    title_multiloc: 'idea_statuses.rejected',
    ordering: 400,
    code: 'rejected',
    color: '#E52516',
    description_multiloc: 'idea_statuses.rejected_description'
  },
  {
    title_multiloc: 'idea_statuses.implemented',
    ordering: 500,
    code: 'implemented',
    color: '#04884C',
    description_multiloc: 'idea_statuses.implemented_description'
  }
].each do |attrs|
  attrs[:title_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:title_multiloc], locales: CL2_SUPPORTED_LOCALES)
  attrs[:description_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:description_multiloc], locales: CL2_SUPPORTED_LOCALES)
  IdeaStatus.create! attrs
end

# Creates initiative statuses.
[
  {
    title_multiloc: 'initiative_statuses.proposed',
    ordering: 100,
    code: 'proposed',
    color: '#687782',
    description_multiloc: 'initiative_statuses.proposed_description'
  },
  {
    title_multiloc: 'initiative_statuses.expired',
    ordering: 200,
    code: 'expired',
    color: '#01A1B1',
    description_multiloc: 'initiative_statuses.expired'
  },
  {
    title_multiloc: 'initiative_statuses.threshold_reached',
    ordering: 300,
    code: 'threshold_reached',
    color: '#04884C',
    description_multiloc: 'initiative_statuses.threshold_reached_description'
  },
  {
    title_multiloc: 'initiative_statuses.answered',
    ordering: 500,
    code: 'answered',
    color: '#04884C',
    description_multiloc: 'initiative_statuses.answered_description'
  },
  {
    title_multiloc: 'initiative_statuses.ineligible',
    ordering: 400,
    code: 'ineligible',
    color: '#E52516',
    description_multiloc: 'initiative_statuses.ineligible_description'
  }
].each do |attrs|
  attrs[:title_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:title_multiloc], locales: CL2_SUPPORTED_LOCALES)
  attrs[:description_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:description_multiloc], locales: CL2_SUPPORTED_LOCALES)
  InitiativeStatus.create! attrs
end

# Creates default topics.
[
  {
    title_multiloc: 'topics.nature',
    description_multiloc: 'topics.nature_description',
    ordering: 0,
    code: 'nature'
  },
  {
    title_multiloc: 'topics.waste',
    description_multiloc: 'topics.waste_description',
    ordering: 1,
    code: 'waste'
  },
  {
    title_multiloc: 'topics.sustainability',
    description_multiloc: 'topics.sustainability_description',
    ordering: 2,
    code: 'sustainability'
  },
  {
    title_multiloc: 'topics.mobility',
    description_multiloc: 'topics.mobility_description',
    ordering: 3,
    code: 'mobility'
  },
  {
    title_multiloc: 'topics.technology',
    description_multiloc: 'topics.technology_description',
    ordering: 4,
    code: 'technology'
  },
  {
    title_multiloc: 'topics.economy',
    description_multiloc: 'topics.economy_description',
    ordering: 5,
    code: 'economy'
  },
  {
    title_multiloc: 'topics.housing',
    description_multiloc: 'topics.housing_description',
    ordering: 6,
    code: 'housing'
  },
  {
    title_multiloc: 'topics.public_space',
    description_multiloc: 'topics.public_space_description',
    ordering: 7,
    code: 'public_space'
  },
  {
    title_multiloc: 'topics.safety',
    description_multiloc: 'topics.safety_description',
    ordering: 8,
    code: 'safety'
  },
  {
    title_multiloc: 'topics.education',
    description_multiloc: 'topics.education_description',
    ordering: 9,
    code: 'education'
  },
  {
    title_multiloc: 'topics.culture',
    description_multiloc: 'topics.culture_description',
    ordering: 10,
    code: 'culture'
  },
  {
    title_multiloc: 'topics.health',
    description_multiloc: 'topics.health_description',
    ordering: 11,
    code: 'health'
  },
  {
    title_multiloc: 'topics.inclusion',
    description_multiloc: 'topics.inclusion_description',
    ordering: 12,
    code: 'inclusion'
  },
  {
    title_multiloc: 'topics.community',
    description_multiloc: 'topics.community_description',
    ordering: 13,
    code: 'community'
  },
  {
    title_multiloc: 'topics.services',
    description_multiloc: 'topics.services_description',
    ordering: 14,
    code: 'services'
  },
  {
    title_multiloc: 'topics.other',
    description_multiloc: 'topics.other_description',
    ordering: 15,
    code: 'other'
  }
].each do |attrs|
  attrs[:title_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:title_multiloc], locales: CL2_SUPPORTED_LOCALES)
  attrs[:description_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:description_multiloc], locales: CL2_SUPPORTED_LOCALES)
  Topic.create! attrs
end

# Creates pages.
[
  {
    slug: 'information',
    title_multiloc: 'pages.infopage_title',
    body_multiloc: 'pages.infopage_body',
    text_images_attributes: [
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: 'e2c7bc7a-017d-4887-a3cb-b94185617a59'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '392d0e47-e5f9-41ab-9ceb-affac617b8b1'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '7b81cbc6-1e22-4511-b96d-867392471bcb'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '02896ca6-6155-4829-8aee-0d1a65fa6193'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: 'dc653d9c-6b69-4f90-b337-25718eb5c250'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '45163616-fc6f-45b1-a5ca-183db79f86d3'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '27345c70-4967-48e6-a6ba-430dde6eeffb'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1548761162/image_nwmsub.png',
        text_reference: '4d291006-0414-4f93-903b-fb911a00d510'
      }
    ]
  },
  {
    slug: 'cookie-policy',
    title_multiloc: 'pages.cookie_policy_title',
    body_multiloc: 'pages.cookie_policy_title'
  },
  {
    slug: 'privacy-policy',
    title_multiloc: 'pages.privacy_policy_title',
    body_multiloc: 'pages.privacy_policy_body'
  },
  {
    slug: 'terms-and-conditions',
    title_multiloc: 'pages.terms_and_conditions_title',
    body_multiloc: 'pages.terms_and_conditions_body'
  },
  {
    slug: 'homepage-info',
    title_multiloc: 'pages.homepage_info_title',
    body_multiloc: 'pages.homepage_info_body'
  },
  {
    slug: 'initiatives',
    title_multiloc: 'pages.initiatives_title',
    body_multiloc: 'pages.initiatives_body',
    text_images_attributes: [
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: '493c1992-608d-4666-90f0-20d38071353d'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: 'd5917ff6-985c-479b-bfb5-4b9d424f0933'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: 'b4e659ab-2830-48fd-b3ce-96e16856262f'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: '43f82d75-2aa1-41ab-8c45-9c8ba9dff49f'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: 'ba16670d-e551-46af-8ba4-51250fb97439'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: 'b4974fd9-7681-4acd-951b-a3979ffc55b0'
      },
      { imageable_field: 'body_multiloc',
        remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1565619952/1d327595-c1b4-4013-8484-cd110cf619b4_odampn.png',
        text_reference: '85a9e561-4c27-4f6b-949a-d8e06905787b'
      }
    ]
  }
].each do |attrs|
  attrs[:title_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:title_multiloc], locales: CL2_SUPPORTED_LOCALES)
  attrs[:body_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:body_multiloc], locales: CL2_SUPPORTED_LOCALES)
  Page.create! attrs
end
ordered_slug_links = ['information', 'cookie-policy', 'privacy-policy', 'terms-and-conditions']
ordered_slug_links.each do |s1|
  (ordered_slug_links - [s1]).each_with_index do |s2, ordering|
    PageLink.create!(
      linking_page: Page.find_by(slug: s1),
      linked_page: Page.find_by(slug: s2),
      ordering: ordering
    )
  end
end

open_idea_project = Project.create!({
  title_multiloc: MultilocService.new.i18n_to_multiloc('projects.open_idea_project_title', locales: CL2_SUPPORTED_LOCALES),
  description_multiloc: MultilocService.new.i18n_to_multiloc('projects.open_idea_project_description', locales: CL2_SUPPORTED_LOCALES),
  description_preview_multiloc: MultilocService.new.i18n_to_multiloc('projects.open_idea_project_description_preview', locales: CL2_SUPPORTED_LOCALES),
  internal_role: 'open_idea_box',
  presentation_mode: 'card',
  process_type: 'continuous',
  participation_method: 'ideation',
  posting_enabled: true,
  commenting_enabled: true,
  voting_enabled: true,
  voting_method: 'unlimited',
  remote_header_bg_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1540214247/carrying-casual-cheerful-1162964_dxubq6.jpg'
})

open_idea_project.project_images.create!(remote_image_url: 'https://res.cloudinary.com/citizenlabco/image/upload/v1539874546/undraw_brainstorming_49d4_iaimmn.png')
open_idea_project.set_default_topics!

User.find_each do |user|
  EmailCampaigns::UnsubscriptionToken.create!(user_id: user.id)
end

EmailCampaigns::AssureCampaignsService.new.assure_campaigns
