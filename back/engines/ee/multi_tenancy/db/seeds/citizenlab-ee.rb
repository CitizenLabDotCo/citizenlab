# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Rails.application.eager_load!

# Since image optimization can be quite slow, we disable any carrierwave image
# processing while seeding. This massively speeds up the seeding process, at
# the expense of not having the proper image dimensions while developing.
CarrierWave.configure do |config|
  config.enable_processing = false
end

# Possible values: large, medium, small, generic, empty
SEED_SIZE = ENV.fetch('SEED_SIZE', 'medium')

SEED_LOCALES = %w[en nl-BE fr-BE].freeze

num_users = 10
num_projects = 4
num_ideas = 5
num_initiatives = 4
case SEED_SIZE
when 'small'
  num_users = 5
  num_projects = 1
  num_ideas = 4
  num_initiatives = 3
when 'medium'
  num_users = 20
  num_projects = 5
  num_ideas = 35
  num_initiatives = 20
when 'large'
  num_users = 50
  num_projects = 20
  num_ideas = 100
  num_initiatives = 60
end

anonymizer = AnonymizeUserService.new

def rand_instance(scope)
  scope.offset(rand(scope.size)).first
end

def create_comment_tree(post, parent, depth = 0)
  amount = rand(5 / (depth + 1))
  amount.times do |_i|
    c = Comment.create!({
      body_multiloc: {
        'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
        'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
      },
      author: rand_instance(User.normal_user),
      post: post,
      parent: parent,
      created_at: Faker::Date.between(from: (parent ? parent.created_at : post.published_at), to: Time.zone.now)
    })
    User.all.each do |u|
      if rand(5) < 2
        Vote.create!(votable: c, user: u, mode: 'up',
          created_at: Faker::Date.between(from: c.created_at, to: Time.zone.now))
      end
    end
    create_comment_tree(post, c, depth + 1)
  end
end

def create_for_some_locales
  translations = {}
  show_en = (rand(6) == 0)
  translations['en'] = yield if show_en
  translations['nl-BE'] = yield if rand(6) == 0 || !show_en
  translations
end

def create_for_tenant_locales
  translations = {}
  SEED_LOCALES.each { |locale| translations[locale] = yield }
  translations
end

def generate_avatar(gender)
  i = rand(2..9)
  unless %w[male female].include? gender
    gender = %w[male female][rand(2)]
  end
  Rails.root.join("spec/fixtures/#{gender}_avatar_#{i}.jpg").open
end

def generate_file_attributes
  {
    file_by_content: {
      name: Faker::File.file_name(ext: 'pdf').split('/').last,
      content: Rails.root.join('spec/fixtures/afvalkalender.pdf').open
    }
  }
end

if %w[public example_org].include? Apartment::Tenant.current
  # rake db:reset clears all instances before repopulating the db.
  CommonPassword.initialize!

  Tenant.create!(
    id: 'c72c5211-8e03-470b-9564-04ec0a8c322b',
    name: 'local',
    host: 'localhost',
    logo: Rails.root.join('spec/fixtures/logo.png').open,
    header_bg: Rails.root.join('spec/fixtures/header.jpg').open,
    created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now),
    settings: SettingsService.new.minimal_required_settings(
      locales: SEED_LOCALES,
      lifecycle_stage: 'active'
    ).deep_merge({
      core: {
        organization_type: %w[small medium large].include?(SEED_SIZE) ? "#{SEED_SIZE}_city" : 'generic',
        organization_name: create_for_tenant_locales { Faker::Address.city },
        currency: CL2_SUPPORTED_CURRENCIES.sample
      },
      customizable_homepage_banner: {
        allowed: true,
        enabled: true,
        layout: 'full_width_banner_layout',
        cta_signed_out_type: 'sign_up_button',
        cta_signed_in_type: 'no_button'
      },
      password_login: {
        allowed: true,
        enabled: true,
        phone: false,
        minimum_length: 8
      },
      facebook_login: {
        allowed: true,
        enabled: true,
        app_id: '1076951489712641',
        app_secret: '6ba5864a8f98894c6d098c8d9e3aaabf'
      },
      google_login: {
        allowed: true,
        enabled: true,
        client_id: '898046778216-8hddufu4irag1bu1sfvsjjaah4i53fpf.apps.googleusercontent.com',
        client_secret: '-Kh_Hx325Pj02t1i50LHsRR6'
      },
      franceconnect_login: {
        allowed: true,
        enabled: true,
        environment: 'integration',
        identifier: '0b8ba0f9a23f16bcbd86c783b2a41fd0cef0ea968e253734de71f641e0e66057',
        secret: '60ffb1156c02cda0b6ff0089e6ca4efc5d28dd6174a62c3a413640b899f0e3ae'
      },
      vienna_login: {
        allowed: true,
        enabled: true,
        environment: 'test'
      },
      pages: {
        allowed: true,
        enabled: true
      },
      private_projects: {
        enabled: true,
        allowed: true
      },
      maps: {
        enabled: true,
        allowed: true,
        tile_provider: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=R0U21P01bsRLx7I7ZRqp',
        map_center: {
          lat: '50.8503',
          long: '4.3517'
        },
        zoom_level: 12,
        osm_relation_id: 2_404_021
      },
      custom_maps: {
        enabled: true,
        allowed: true
      },
      custom_topics: {
        enabled: true,
        allowed: true
      },
      custom_accessibility_statement_link: {
        enabled: false,
        allowed: false
      },
      project_reports: {
        enabled: true,
        allowed: true
      },
      blocking_profanity: {
        enabled: true,
        allowed: true
      },
      user_confirmation: {
        enabled: true,
        allowed: true
      },
      user_custom_fields: {
        enabled: true,
        allowed: true
      },
      representativeness: {
        enabled: true,
        allowed: true
      },
      content_builder: {
        enabled: true,
        allowed: true
      },
      custom_idea_statuses: {
        enabled: true,
        allowed: true
      },
      customizable_navbar: {
        enabled: true,
        allowed: true
      },
      idea_custom_fields: {
        enabled: true,
        allowed: true
      },
      widgets: {
        enabled: true,
        allowed: true
      },
      admin_project_templates: {
        enabled: true,
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
      manual_emailing: {
        enabled: true,
        allowed: true
      },
      automated_emailing_control: {
        enabled: true,
        allowed: true
      },
      granular_permissions: {
        enabled: true,
        allowed: true
      },
      participatory_budgeting: {
        enabled: true,
        allowed: true
      },
      machine_translations: {
        enabled: true,
        allowed: true
      },
      similar_ideas: {
        enabled: true,
        allowed: true
      },
      geographic_dashboard: {
        enabled: true,
        allowed: true
      },
      intercom: {
        enabled: true,
        allowed: true
      },
      segment: {
        enabled: false,
        allowed: false
      },
      satismeter: {
        enabled: true,
        allowed: true,
        write_key: ENV.fetch('DEFAULT_SATISMETER_WRITE_KEY')
      },
      google_analytics: {
        enabled: true,
        allowed: true,
        tracking_id: ENV.fetch('DEFAULT_GA_TRACKING_ID')
      },
      google_tag_manager: {
        enabled: true,
        allowed: true,
        destinations: 'InvasiveTracking',
        container_id: ENV.fetch('DEFAULT_GTM_CONTAINER_ID')
      },
      matomo: {
        enabled: true,
        allowed: true,
        product_site_id: ENV.fetch('MATOMO_PRODUCT_SITE_ID', ''),
        tenant_site_id: ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID', '')
      },
      smart_groups: {
        enabled: true,
        allowed: true
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
      survey_xact_surveys: {
        enabled: true,
        allowed: true
      },
      surveymonkey_surveys: {
        enabled: true,
        allowed: true
      },
      enalyzer_surveys: {
        enabled: true,
        allowed: true
      },
      qualtrics_surveys: {
        enabled: true,
        allowed: true
      },
      smart_survey_surveys: {
        enabled: true,
        allowed: true
      },
      microsoft_forms_surveys: {
        enabled: true,
        allowed: true
      },
      snap_survey_surveys: {
        enabled: true,
        allowed: true
      },
      events_widget: {
        enabled: true,
        allowed: true
      },
      initiatives: {
        enabled: true,
        allowed: true,
        voting_threshold: 20,
        days_limit: 5,
        threshold_reached_message: MultilocService.new.i18n_to_multiloc(
          'initiatives.default_threshold_reached_message',
          locales: CL2_SUPPORTED_LOCALES
        ),
        eligibility_criteria: MultilocService.new.i18n_to_multiloc(
          'initiatives.default_eligibility_criteria',
          locales: CL2_SUPPORTED_LOCALES
        )
      },
      polls: {
        enabled: true,
        allowed: true
      },
      insights_manual_flow: {
        enabled: true,
        allowed: true
      },
      insights_nlp_flow: {
        enabled: true,
        allowed: true
      },
      verification: {
        enabled: true,
        allowed: true,
        verification_methods: [
          {
            name: 'cow',
            api_username: 'fake_username',
            api_password: 'fake_password',
            rut_empresa: 'fake_rut_empresa'
          },
          {
            name: 'bosa_fas',
            environment: 'integration',
            identifier: 'fake_identifier',
            secret: 'fake_secret'
          },
          {
            name: 'clave_unica',
            client_id: 'fake_identifier',
            client_secret: 'fake_secret'
          },
          {
            name: 'bogus'
          },
          {
            name: 'id_card_lookup',
            method_name_multiloc: { en: 'Enter social security number' },
            card_id_multiloc: { en: 'Social security number' },
            card_id_placeholder: 'xx-xxxxx-xx',
            card_id_tooltip_multiloc: {
              en: 'You can find this number on you ID card. We check your number without storing it.'
            },
            explainer_image_url: 'http://localhost:4000/id_card_explainer.jpg'
          },
          {
            name: 'franceconnect'
          },
          {
            name: 'auth0',
            client_id: 'fake_client_id',
            client_secret: 'fake_client_secret',
            domain: 'fake_domain',
            method_name_multiloc: { en: 'Verify with Auth0' }
          }
        ]
      },
      volunteering: {
        enabled: true,
        allowed: true
      },
      project_folders: {
        enabled: true,
        allowed: true
      },
      moderation: {
        enabled: true,
        allowed: true
      },
      flag_inappropriate_content: {
        enabled: true,
        allowed: true
      },
      project_management: {
        enabled: true,
        allowed: true
      },
      project_visibility: {
        enabled: true,
        allowed: true
      },
      disable_downvoting: {
        enabled: true,
        allowed: true
      },
      texting: {
        enabled: true,
        allowed: true,
        from_number: '+12345678912',
        monthly_sms_segments_limit: 100_000
      }
    })
  )

  Tenant.create!(
    id: '07ff8088-cc78-4307-9a1c-ebb6fb836f96',
    name: 'empty',
    host: 'empty.localhost',
    logo: Rails.root.join('spec/fixtures/logo.png').open,
    header_bg: Rails.root.join('spec/fixtures/header.jpg').open,
    created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now),
    settings: SettingsService.new.minimal_required_settings(locales: %w[en nl-BE], lifecycle_stage: 'active')
  )
end

admin = {
  id: '386d255e-2ff1-4192-8e50-b3022576be50',
  email: 'admin@citizenlab.co',
  password: 'democracy2.0',
  roles: [{ type: 'admin' }],
  locale: 'en'
}
moderator = {
  id: '61caabce-f7e5-4804-b9df-36d7d7d73e4d',
  email: 'moderator@citizenlab.co',
  password: 'democracy2.0',
  roles: []
}
user = {
  id: '546335a3-33b9-471c-a18a-d5b58ebf173a',
  email: 'user@citizenlab.co',
  password: 'democracy2.0',
  roles: []
}

if Apartment::Tenant.current == 'empty_localhost'
  MultiTenancy::TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  random_user = anonymizer.anonymized_attributes(Tenant.current.settings.dig('core', 'locales'))
  User.create! random_user.merge({ **admin, id: 'e0d698fc-5969-439f-9fe6-e74fe82b567a' })
end

if Apartment::Tenant.current == 'localhost'
  PublicApi::ApiClient.create!(
    id: '42cb419a-b1f8-4600-8c4e-fd45cca4bfd9',
    secret: 'Hx7C27lxV7Qszw-zCg9UT-GFRQuxJNffllTpeU262CGabllbyTYwOmpizCygtPIZSwg'
  )

  custom_field = nil
  if SEED_SIZE != 'empty'
    custom_field = CustomField.create!(
      resource_type: 'User',
      key: 'politician',
      input_type: 'select',
      title_multiloc: { 'en' => 'Are you a politician?' },
      description_multiloc: { 'en' => 'We use this to provide you with customized information' },
      required: false
    )

    CustomFieldOption.create!(custom_field: custom_field, key: 'active_politician',
      title_multiloc: { 'en' => 'Active politician' })
    CustomFieldOption.create!(custom_field: custom_field, key: 'retired_politician',
      title_multiloc: { 'en' => 'Retired politician' })
    CustomFieldOption.create!(custom_field: custom_field, key: 'no', title_multiloc: { 'en' => 'No' })

    12.times do
      Area.create!({
        title_multiloc: create_for_tenant_locales { Faker::Address.city },
        description_multiloc: create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join }
      })
    end
  end

  MultiTenancy::TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
  User.create! anonymizer.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(admin)
  User.create! anonymizer.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(moderator)
  User.create! anonymizer.anonymized_attributes(Tenant.current.settings.dig('core', 'locales')).merge(user)

  if SEED_SIZE != 'empty'
    num_users.times do
      User.create! anonymizer.anonymized_attributes(Tenant.current.settings.dig('core',
        'locales')).merge({ password: 'democracy2.0' })
    end

    Area.create!({
      title_multiloc: create_for_tenant_locales { 'Westbrook' },
      description_multiloc: create_for_tenant_locales { '<p>The place to be these days</p>' }
    })

    3.times do
      Topic.create!({
        title_multiloc: create_for_tenant_locales { Faker::Lorem.word },
        description_multiloc: create_for_tenant_locales { Faker::Lorem.sentence }
      })
    end

    2.times do
      folder = ProjectFolders::Folder.create!( # TODO: move to ProjectFolders engine
        title_multiloc: create_for_tenant_locales { Faker::Lorem.sentence },
        description_multiloc: create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
        description_preview_multiloc: create_for_tenant_locales { Faker::Lorem.sentence },
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        admin_publication_attributes: {
          publication_status: %w[published published published published published draft
            archived][rand(7)]
        }
      )
      [0, 1, 2, 3, 4][rand(5)].times do |_i|
        folder.images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      rand(1..3).times do
        folder.files.create!(generate_file_attributes)
      end
    end

    num_projects.times do
      project = Project.new({
        title_multiloc: create_for_tenant_locales { Faker::Lorem.sentence },
        description_multiloc: create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
        description_preview_multiloc: create_for_tenant_locales { Faker::Lorem.sentence },
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        visible_to: %w[admins groups public public public][rand(5)],
        presentation_mode: %w[card card card map map][rand(5)],
        process_type: %w[timeline timeline timeline timeline continuous][rand(5)],
        areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
        allowed_input_topics: Topic.all.shuffle.take(rand(Topic.count) + 1),
        admin_publication_attributes: {
          parent_id: (rand(2) == 0 ? nil : AdminPublication.where(publication_type: ProjectFolders::Folder.name).ids.sample),
          publication_status: %w[published published published published published draft
            archived][rand(7)]
        }
      })

      if project.continuous?
        project.update({
          posting_enabled: rand(4) != 0,
          voting_enabled: rand(4) != 0,
          downvoting_enabled: rand(3) != 0,
          commenting_enabled: rand(4) != 0,
          upvoting_method: %w[unlimited unlimited unlimited limited][rand(4)],
          upvoting_limited_max: rand(1..15),
          downvoting_method: %w[unlimited unlimited unlimited limited][rand(4)],
          downvoting_limited_max: rand(1..15)
        })
      end

      project.save!

      [0, 1, 2, 3, 4][rand(5)].times do |_i|
        project.project_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if project.continuous? && rand(5) == 0
        rand(1..3).times do
          project.project_files.create!(generate_file_attributes)
        end
      end

      if project.timeline?
        start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
        has_budgeting = false
        rand(8).times do
          start_at += 1.day
          phase = project.phases.new({
            title_multiloc: create_for_tenant_locales { Faker::Lorem.sentence },
            description_multiloc: create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
            start_at: start_at,
            end_at: (start_at += rand(150).days),
            participation_method: %w[ideation budgeting poll information ideation ideation][rand(6)]
          })
          if phase.budgeting?
            if has_budgeting
              phase.participation_method = 'ideation'
            else
              has_budgeting = true
            end
          end
          if phase.ideation?
            phase.assign_attributes({
              posting_enabled: rand(4) != 0,
              voting_enabled: rand(4) != 0,
              downvoting_enabled: rand(3) != 0,
              commenting_enabled: rand(4) != 0,
              upvoting_method: %w[unlimited unlimited unlimited limited][rand(4)],
              upvoting_limited_max: rand(1..15),
              downvoting_method: %w[unlimited unlimited unlimited limited][rand(4)],
              downvoting_limited_max: rand(1..15)
            })
          end
          if phase.budgeting?
            phase.assign_attributes({
              max_budget: (rand(100..1_000_099)).round(-2)
            })
          end
          phase.save!
          if rand(5) == 0
            rand(1..3).times do
              phase.phase_files.create!(generate_file_attributes)
            end
          end
          next unless phase.poll?

          questions = Array.new((rand(1..5))) do
            question = Polls::Question.create!(
              title_multiloc: create_for_some_locales { Faker::Lorem.question },
              participation_context: phase
            )
            rand(1..5).times do
              Polls::Option.create!(
                question: question,
                title_multiloc: create_for_some_locales { Faker::Lorem.sentence }
              )
            end
            question
          end
          User.order('RANDOM()').take(rand(1..5)).each do |some_user|
            response = Polls::Response.create!(user: some_user, participation_context: phase)
            questions.each do |q|
              response.response_options.create!(option: rand_instance(q.options))
            end
          end
        end
      end

      rand(5).times do
        start_at = Faker::Date.between(from: Tenant.current.created_at, to: 1.year.from_now)
        event = project.events.create!({
          title_multiloc: create_for_some_locales { Faker::Lorem.sentence },
          description_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
          location_multiloc: create_for_some_locales { Faker::Address.street_address },
          start_at: start_at,
          end_at: start_at + rand(12).hours
        })
        next unless rand(5) == 0

        rand(1..3).times do
          event.event_files.create!(generate_file_attributes)
        end
      end

      ([User.find_by(email: 'moderator@citizenlab.co')] + User.where.not(email: %w[admin@citizenlab.co
        user@citizenlab.co]).shuffle.take(rand(5))).each do |some_moderator|
        some_moderator.add_role 'project_moderator', project_id: project.id
        some_moderator.save!
      end

      if rand(5) == 0
        project.save!
      end
    end

    MAP_CENTER = [50.8503, 4.3517].freeze
    MAP_OFFSET = 0.1

    num_ideas.times do
      created_at = Faker::Date.between(from: Tenant.current.created_at, to: Time.zone.now)
      project = rand_instance Project.all
      phases = []
      if project&.timeline?
        phases = project.phases.sample(rand(project.phases.size)).select(&:can_contain_ideas?)
      end
      offsets = Array.new(rand(3)) do
        rand(project.allowed_input_topics.count)
      end
      topics = offsets.uniq.map { |offset| project.allowed_input_topics.offset(offset).first }
      idea = Idea.create!({
        title_multiloc: create_for_some_locales { Faker::Lorem.sentence[0...80] },
        body_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
        idea_status: rand_instance(IdeaStatus.all),
        topics: topics,
        author: rand_instance(User.all),
        project: project,
        phases: phases,
        publication_status: 'published',
        published_at: Faker::Date.between(from: created_at, to: Time.zone.now),
        created_at: created_at,
        location_point: rand(3) == 0 ? nil : "POINT(#{MAP_CENTER[1] + (((rand * 2) - 1) * MAP_OFFSET)} #{MAP_CENTER[0] + (((rand * 2) - 1) * MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
        budget: rand(3) == 0 ? nil : (rand(10**rand(2..4)) + 50).round(-1),
        proposed_budget: rand(3) == 0 ? nil : (rand(10**rand(2..4)) + 50).round(-1)
      })

      [0, 0, 1, 1, 2][rand(5)].times do |_i|
        idea.idea_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
        rand(1..3).times do
          idea.idea_files.create!(generate_file_attributes)
        end
      end

      User.all.each do |u|
        r = rand(5)
        if r == 0
          Vote.create!(votable: idea, user: u, mode: 'down',
            created_at: Faker::Date.between(from: idea.published_at, to: Time.zone.now))
        elsif r > 0 && r < 3
          Vote.create!(votable: idea, user: u, mode: 'up',
            created_at: Faker::Date.between(from: idea.published_at, to: Time.zone.now))
        end
      end

      rand(5).times do
        idea.official_feedbacks.create!(
          body_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
          author_multiloc: create_for_some_locales { Faker::FunnyName.name },
          user: rand_instance(User.admin)
        )
      end

      create_comment_tree(idea, nil)
    end

    num_initiatives.times do
      created_at = Faker::Date.between(from: Tenant.current.created_at, to: Time.zone.now)
      initiative = Initiative.create!(
        title_multiloc: create_for_some_locales { Faker::Lorem.sentence[0...80] },
        body_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
        author: User.offset(rand(User.count)).first,
        publication_status: 'published',
        published_at: Faker::Date.between(from: created_at, to: Time.zone.now),
        created_at: created_at,
        location_point: rand(3) == 0 ? nil : "POINT(#{MAP_CENTER[1] + (((rand * 2) - 1) * MAP_OFFSET)} #{MAP_CENTER[0] + (((rand * 2) - 1) * MAP_OFFSET)})",
        location_description: rand(2) == 0 ? nil : Faker::Address.street_address,
        header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
        topics: Array.new(rand(3)) { rand(Topic.count) }.uniq.map { |offset| Topic.offset(offset).first },
        areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
        assignee: rand(5) == 0 ? User.admin.sample : nil
      )
      # TODO: make initiative statuses correspond with required votes reached
      InitiativeStatusChange.create!(
        created_at: initiative.published_at,
        initiative: initiative,
        initiative_status: InitiativeStatus.offset(rand(InitiativeStatus.count)).first
      )

      [0, 0, 1, 1, 2][rand(5)].times do |_i|
        initiative.initiative_images.create!(image: Rails.root.join("spec/fixtures/image#{rand(20)}.png").open)
      end
      if rand(5) == 0
        rand(1..3).times do
          initiative.initiative_files.create!(generate_file_attributes)
        end
      end

      User.all.each do |u|
        r = rand(5)
        if r < 2
          Vote.create!(votable: initiative, user: u, mode: 'up',
            created_at: Faker::Date.between(from: initiative.published_at, to: Time.zone.now))
        end
      end

      rand(5).times do
        initiative.official_feedbacks.create!(
          body_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
          author_multiloc: create_for_some_locales { Faker::FunnyName.name },
          user: User.admin.sample
        )
      end

      create_comment_tree(initiative, nil)
    end

    Phase.where(participation_method: 'budgeting').each do |phase|
      User.all.shuffle.take(rand(1..20)).each do |some_user|
        chosen_ideas = phase.project.ideas.select(&:budget).shuffle.take(rand(10))
        Basket.create!({
          user: some_user,
          participation_context: phase,
          ideas: chosen_ideas
        })
      end
    end

    8.times do
      StaticPage.create!({
        title_multiloc: create_for_some_locales { Faker::Lorem.sentence },
        body_multiloc: create_for_some_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join }
      })
    end

    3.times do
      Group.create!({
        membership_type: 'manual',
        title_multiloc: create_for_some_locales { Faker::Lorem.sentence },
        projects: Project.all.shuffle.take(rand(Project.count)),
        members: User.all.shuffle.take(rand(User.count))
      })
    end
    Group.create!({
      membership_type: 'rules',
      title_multiloc: create_for_some_locales { 'Citizenlab Heroes' },
      rules: [
        { ruleType: 'email', predicate: 'ends_on', value: '@citizenlab.co' }
      ]
    })

    5.times do
      Invite.create!(
        invitee: User.create!(email: Faker::Internet.email, locale: 'en', invite_status: 'pending',
          first_name: Faker::Name.first_name, last_name: Faker::Name.last_name)
      )
    end

    volunteering_project = Project.create!(
      title_multiloc: {
        en: 'Help out as a volunteer',
        'nl-BE': 'Help mee als vrijwilliger',
        'fr-BE': 'Aider en tant que bénévole'
      },
      description_multiloc: create_for_tenant_locales { Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join },
      description_preview_multiloc: {
        'en' => 'Every bit of help counts',
        'nl-BE' => 'Alle beetjes helpen',
        'fr-BE' => 'Chaque petit geste compte'
      },
      header_bg: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open,
      process_type: 'continuous',
      areas: Array.new(rand(3)) { rand(Area.count) }.uniq.map { |offset| Area.offset(offset).first },
      participation_method: 'volunteering',
      admin_publication_attributes: {
        publication_status: 'published'
      }
    )

    Volunteering::Cause.create!([
      {
        participation_context: volunteering_project,
        title_multiloc: { en: 'Video calls' },
        description_multiloc: {
          'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
          'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
        },
        image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open
      },
      {
        participation_context: volunteering_project,
        title_multiloc: { en: 'Doing groceries' },
        description_multiloc: {
          'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
          'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
        },
        image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open
      },
      {
        participation_context: volunteering_project,
        title_multiloc: { en: 'Going to the post office' },
        description_multiloc: { en: '<p>Many people should stay inside. They are at home and cannot go to the post office to post a letter or to pick up a parcel. Can you help them?</p><h4>Necessary material</h4><ul><li>sport to go to the post office.</li></ul><p>We provide you with the contact details of this person. Arrange by phone or mail what you have to post or pick up. Don’t go inside the house of this person but pick up the mail or drop it at the door.</p><p>Always observe the hygienic precautions.</p><h4>Profile of the volunteer</h4><ul><li>You’re between 16 and 60 years old.</li><li>You’re healthy and show no symptoms.</li><li>You haven’t been in a risk area recently.</li><li>You’ve had no contact with people who have been in a risk area recently.</li></ul>' },
        image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open
      },
      {
        participation_context: volunteering_project,
        title_multiloc: { en: 'Walking the dog' },
        description_multiloc: {
          'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
          'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
        },
        image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open
      },
      {
        participation_context: volunteering_project,
        title_multiloc: { en: 'Writing letters' },
        description_multiloc: {
          'en' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join,
          'nl-BE' => Faker::Lorem.paragraphs.map { |p| "<p>#{p}</p>" }.join
        },
        image: rand(5) == 0 ? nil : Rails.root.join("spec/fixtures/image#{rand(20)}.png").open
      }
    ])

    Permission.all.shuffle.take(rand(1..10)).each do |permission|
      permitted_by = if permission.action == 'taking_survey'
        %w[everyone users groups admins_moderators]
      else
        %w[users groups admins_moderators]
      end.sample
      permission.permitted_by = permitted_by
      if permitted_by == 'groups'
        permission.groups = Group.all.shuffle.take(rand(5))
      end
      permission.save!
    end

    InitiativeStatusService.new.automated_transitions!

    # 10.times do |i|
    #   IdIdCardLookup::IdCard.create!(card_id: i.to_s*3)
    # end

    3.times do |_i|
      process_type = %w[continuous timeline timeline].sample
      project = case process_type
      when 'timeline'
        Phase.where(participation_method: %w[ideation budgeting]).all.sample&.project
      when 'continuous'
        Project.where(participation_method: %w[ideation budgeting]).all.sample
      end

      next unless project

      custom_form = project.custom_form || CustomForm.create!(project: project)
      custom_field = IdeaCustomFieldsService.new.find_or_build_field(custom_form,
        %w[title_multiloc body_multiloc location_description].sample)
      custom_field.description_multiloc = create_for_some_locales { Faker::Lorem.sentence }
      custom_field.save!
    end

    20.times do
      Volunteering::Volunteer.create(
        cause: rand_instance(Volunteering::Cause.all),
        user: rand_instance(User.active.all)
      )
    end
  end

  map_config = CustomMaps::MapConfig.create!(
    project: Project.find_by!(internal_role: 'open_idea_box'),
    center: RGeo::Cartesian.factory.point(4.3517103, 50.8503396),
    zoom_level: 14
  )

  CustomMaps::Layer.create!(
    map_config: map_config,
    title_multiloc: { en: 'Districts', 'nl-BE': 'Districten' },
    geojson: JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', 'brussels-districts.geojson'))),
    default_enabled: true
  )
  CustomMaps::LegendItem.create!([
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Laeken' }, color: '#3b7d6c' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Neder-Over-Heembeek' }, color: '#2816b8' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Nord' }, color: '#df2397' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Louise' }, color: '#06149e' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Haren' }, color: '#e90303' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Nord-Est' }, color: '#54b1e4' },
    { map_config: map_config, title_multiloc: { 'fr-BE': 'Pentagone' }, color: '#249e0c' }
  ])

  CustomMaps::Layer.create!(
    map_config: map_config,
    title_multiloc: { en: 'Public toilets', 'nl-BE': 'Publieke toiletten' },
    geojson: JSON.parse(File.read(CustomMaps::Engine.root.join('spec', 'fixtures',
      'bruxelles_toilettes_publiques.geojson'))),
    default_enabled: false
  )
end

unless Apartment::Tenant.current == 'public'
  User.find_each do |some_user|
    EmailCampaigns::UnsubscriptionToken.create!(user_id: some_user.id)
  end
  MultiTenancy::TenantService.new.finalize_creation Tenant.current
end
