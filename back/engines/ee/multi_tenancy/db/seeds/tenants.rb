# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class Tenants < Base
      def run
        create_localhost_tenant
        create_empty_localhost_tenant if runner.create_empty_tenant?
      end

      def create_localhost_tenant
        Tenant.create!(
          id: 'c72c5211-8e03-470b-9564-04ec0a8c322b',
          name: 'local',
          host: 'localhost',
          logo: Rails.root.join('spec/fixtures/logo.png').open,
          created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now),
          settings: SettingsService.new.minimal_required_settings(
            locales: runner.seed_locales,
            lifecycle_stage: 'active'
          ).deep_merge({
            core: {
              organization_type: "#{runner.seed_size}_city",
              organization_name: runner.create_for_tenant_locales { Faker::Address.city },
              currency: CL2_SUPPORTED_CURRENCIES.sample
            },
            customizable_homepage_banner: {
              allowed: true,
              enabled: true
            },
            password_login: {
              allowed: true,
              enabled: true,
              enable_signup: true,
              phone: false,
              minimum_length: 8
            },
            facebook_login: {
              allowed: true,
              enabled: true,
              app_id: '***REMOVED***',
              app_secret: '***REMOVED***'
            },
            google_login: {
              allowed: true,
              enabled: true,
              client_id: '***REMOVED***',
              client_secret: '***REMOVED***'
            },
            franceconnect_login: {
              allowed: true,
              enabled: true,
              environment: 'integration',
              identifier: '***REMOVED***',
              secret: '***REMOVED***'
            },
            vienna_citizen_login: {
              allowed: true,
              enabled: true,
              environment: 'test'
            },
            vienna_employee_login: {
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
              tile_provider: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=***REMOVED***',
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
            representativeness: {
              enabled: true,
              allowed: true
            },
            bulk_import_ideas: {
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
            idea_custom_fields: {
              enabled: true,
              allowed: true
            },
            dynamic_idea_form: {
              enabled: true,
              allowed: true
            },
            idea_author_change: {
              enabled: true,
              allowed: true
            },
            idea_custom_copy: {
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
            },
            native_surveys: {
              enabled: true,
              allowed: true
            },
            analytics: {
              enabled: true,
              allowed: true
            },
            visitors_dashboard: {
              enabled: true,
              allowed: true
            }
          })
        )
      end

      def create_empty_localhost_tenant
        Tenant.create!(
          id: '07ff8088-cc78-4307-9a1c-ebb6fb836f96',
          name: 'empty',
          host: 'empty.localhost',
          logo: Rails.root.join('spec/fixtures/logo.png').open,
          created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now),
          settings: SettingsService.new.minimal_required_settings(locales: %w[en nl-BE], lifecycle_stage: 'active')
        )
      end
    end
  end
end
