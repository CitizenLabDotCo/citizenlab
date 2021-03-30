def create_for_current_locales
  translations = {}
  AppConfiguration.instance.settings.dig('core', 'locales').each { |locale| translations[locale] = yield }
  translations
end

# Adds a list of common passwords.
CommonPassword.initialize!

# Configure your app here.
AppConfiguration.create!(
  id: '82704e43-2ebe-496e-bed7-1647925ba5ff',
  name: 'local',
  host: 'localhost',
  # logo: Rails.root.join("spec/fixtures/logo.png").open, # => NoMethodError: undefined method `tenant' for #<AppConfiguration:0x000055f40803d3b8>
  # header_bg: Rails.root.join("spec/fixtures/header.jpg").open, # => NoMethodError: undefined method `tenant' for #<AppConfiguration:0x000055f40803d3b8>
  created_at: Faker::Date.between(from: Time.now - 1.year, to: Time.now),
  settings: {
    core: {
      allowed: true,
      enabled: true,
      locales: ['en', 'nl-BE', 'fr-BE'],
      organization_type: 'small_city',
      organization_name: {
        'en' => Faker::Address.city,
        'nl-BE' => Faker::Address.city,
        'fr-FR' => Faker::Address.city
      },
      timezone: 'Brussels',
      currency: CL2_SUPPORTED_CURRENCIES.shuffle.first,
      color_main: Faker::Color.hex_color,
      color_secondary: Faker::Color.hex_color,
      color_text: Faker::Color.hex_color,
    },
    password_login: {
      enabled: true,
      allowed: true
    },
    maps: {
      enabled: true,
      allowed: true,
      map_center: {
        lat: '50.8503',
        long: '4.3517'
      },
      zoom_level: 12
    },
    intercom: {
      enabled: true,
      allowed: true
    },
    segment: {
      enabled: true,
      allowed: true
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
      allowed: true
    },
    google_forms_surveys: {
      enabled: true,
      allowed: true
    },
    enalyzer_surveys: {
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
      enabled: true,
      allowed: true
    },
    project_reports: {
      enabled: true,
      allowed: true
    },
    admin_project_templates: {
      enabled: true,
      allowed: true
    },
    ideas_overview: {
      enabled: true,
      allowed: true
    },
    disable_downvoting: {
      # Disabled.
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
      enabled: true,
      allowed: true
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
      # Disabled.
      enabled: false,
      allowed: true,
      rules: [
        # Add your rules here.
      ]
    },
    abbreviated_user_names: {
      # Disabled.
      enabled: false,
      allowed: true
    },
    idea_custom_copy: {
      # Disabled.
      enabled: false,
      allowed: true
    },
    private_projects: {
      enabled: true,
      allowed: true
    },
    fragments: {
      # Disabled.
      enabled: false,
      allowed: true,
      enabled_fragments: [
        # Add your fragments here.
      ]
    }
  }
)

# Creates a default admin account.
User.create! AnonymizeUserService.new.anonymized_attributes(AppConfiguration.instance.settings.dig('core', 'locales')).merge({
  id: '9c1bf0cf-5591-4cad-a860-9f6064a33a0f',
  email: 'admin@citizenlab.co',
  password: 'I<3CitizenLab',
  roles: [
    {type: 'admin'},
  ],
  locale: 'en',
  custom_field_values: {}
})

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
    title_multiloc: 'idea_statuses.accepted',
    ordering: 200,
    code: 'accepted',
    color: '#04884C',
    description_multiloc: 'idea_statuses.accepted_description'
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
  }
].each do |attrs|
  attrs[:title_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:title_multiloc], locales: CL2_SUPPORTED_LOCALES)
  attrs[:description_multiloc] = MultilocService.new.i18n_to_multiloc(attrs[:description_multiloc], locales: CL2_SUPPORTED_LOCALES)
  InitiativeStatus.create! attrs
end

# Creates topics.
Topic::DEFAULT_CODES.shuffle.take(rand(5)+1).each do |code|
  Topic.create!({
    title_multiloc: create_for_current_locales{Faker::Lorem.word},
    description_multiloc: create_for_current_locales{Faker::Lorem.sentence},
    code: code
  })
end

# Creates pages.
%i[information cookie-policy privacy-policy terms-and-conditions homepage-info initiatives].each do |slug|
  Page.create!({
    title_multiloc: create_for_current_locales{Faker::Lorem.sentence},
    body_multiloc: create_for_current_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
    slug: slug
  })
end

# Creates unsubscription tokens.
User.all.each do |user|
  EmailCampaigns::UnsubscriptionToken.create!(user_id: user.id)
end