namespace :cl2_back do
  desc "Create a tenant with given host and optional template"
  task :create_tenant, [:host,:template] => [:environment] do |t, args|
    host = args[:host] || raise("Please provide the 'host' arg")
    tenant_template = args[:template] || 'e2etests_template'

    Tenant.find_by(host: host)&.destroy!

    tenant = Tenant.create!({
      name: host,
      host: host,
      logo: Rails.root.join("spec/fixtures/logo.png").open,
      header_bg: Rails.root.join("spec/fixtures/header.jpg").open,
      settings: {
        core: {
          allowed: true,
          enabled: true,
          locales: ['en','nl-BE', 'nl-NL', 'fr-BE'],
          organization_type: 'medium_city',
          organization_name: {
            "en" => 'Wonderville',
            "nl-BE" => 'Mirakelgem',
          },
          timezone: "Brussels",
          currency: 'EUR',
          color_main: '#163A7D',
          color_secondary: '#CF4040',
          color_text: '#163A7D',
          signup_helper_text: {
            en: 'If you don\'t want to register, use hello@citizenlab.co/democrazy as email/password'
          }
        },
        private_projects: {
          enabled: true,
          allowed: true
        },
        manual_tagging: {
          enabled: true,
          allowed: true
        },
        automatic_tagging: {
          enabled: true,
          allowed: true
        },
        user_custom_fields: {
          enabled: true,
          allowed: true
        },
        custom_idea_statuses: {
          enabled: true,
          allowed: true
        },
        idea_custom_copy: {
          enabled: false,
          allowed: false
        },
        idea_custom_fields: {
          enabled: true,
          allowed: true
        },
        clustering: {
          enabled: true,
          allowed: true
        },
        project_reports: {
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
        granular_permissions: {
          enabled: true,
          allowed: true
        },
        password_login: {
          enabled: true,
          allowed: true,
          phone: false,
        },
        participatory_budgeting: {
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
          enabled: true,
          allowed: true
        },
        satismeter: {
          enabled: true,
          allowed: true
        },
        google_analytics: {
          enabled: true,
          allowed: true
        },
        google_tag_manager: {
          enabled: false,
          allowed: false
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
        surveymonkey_surveys: {
          enabled: true,
          allowed: true
        },
        enalyzer_surveys: {
          enabled: true,
          allowed: true
        },
        initiatives: {
          enabled: true,
          allowed: true,
          voting_threshold: 300,
          days_limit: 90,
          threshold_reached_message: MultilocService.new.i18n_to_multiloc(
            'initiatives.default_threshold_reached_message',
            locales: CL2_SUPPORTED_LOCALES
          ),
          eligibility_criteria: MultilocService.new.i18n_to_multiloc(
            'initiatives.default_eligibility_criteria',
            locales: CL2_SUPPORTED_LOCALES
          ),
          success_stories: [
            {
              "page_slug": "initiatives-success-1",
              "location": Faker::Address.city,
              "image_url": "https://www.quebecoriginal.com/en/listing/images/800x600/7fd3e9f7-aec9-4966-9751-bc0a1ab56127/parc-des-deux-rivieres-parc-des-deux-rivieres-en-ete.jpg",
            },
            {
              "page_slug": "initiatives-success-2",
              "location": Faker::Address.city,
              "image_url": "https://www.washingtonpost.com/resizer/I9IJifRLgy3uHVKcwZlvdjUBirc=/1484x0/arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/ZQIB4NHDUMI6RKZMWMO42U6KNM.jpg",
            },
            {
              "page_slug": "initiatives-success-3",
              "location": Faker::Address.city,
              "image_url": "http://upthehillandthroughthewoods.files.wordpress.com/2012/12/1____image.jpg",
            }
          ]
        },
        polls: {
          enabled: true,
          allowed: true
        },
        admin_project_templates: {
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
              name: 'bogus'
            },
            {
              name: 'id_card_lookup',
              method_name_multiloc: {en: 'Enter social security number'},
              card_id_multiloc: {en: 'Social security number'},
              card_id_placeholder: "xx-xxxxx-xx",
              card_id_tooltip_multiloc: {
                en: 'You can find this number on you ID card. We check your number without storing it.'
              },
              explainer_image_url: "http://localhost:4000/id_card_explainer.jpg"
            },
            {
              name: 'franceconnect'
            },
          ]
        },
        project_folders: {
          enabled: true,
          allowed: true
        },
        volunteering: {
          enabled: true,
          allowed: true
        },
        custom_topics: {
          enabled: true,
          allowed: true
        },
        smart_groups: {
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
      }
    })


    Apartment::Tenant.switch tenant.schema_name do
      TenantTemplateService.new.resolve_and_apply_template tenant_template, external_subfolder: 'release'
      User.create(
        roles: [{type: 'admin'}],
        first_name: 'Citizen',
        last_name: 'Lab',
        email: 'hello@citizenlab.co',
        password: 'democrazy',
        locale: tenant.settings.dig('core', 'locales')&.first || 'en',
        registration_completed_at: Time.now
      )
    end


    MultiTenancy::SideFxTenantService.new.after_apply_template(tenant, nil)
    MultiTenancy::SideFxTenantService.new.after_create(tenant, nil)

  end
end
