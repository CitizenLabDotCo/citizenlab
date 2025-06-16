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
        tenant_attrs = {
          id: 'c72c5211-8e03-470b-9564-04ec0a8c322b',
          name: 'local',
          host: 'localhost',
          created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now)
        }

        config_attrs = tenant_attrs.merge(
          logo: Rails.root.join('spec/fixtures/logo.png').open,
          settings: SettingsService.new.minimal_required_settings(
            locales: runner.seed_locales,
            lifecycle_stage: 'active',
            country_code: 'BE'
          ).deep_merge({
            core: {
              organization_type: "#{runner.seed_size}_city",
              organization_name: runner.create_for_tenant_locales { Faker::Address.city },
              currency: CL2_SUPPORTED_CURRENCIES.sample,
              maximum_admins_number: 2,
              maximum_moderators_number: 2,
              additional_admins_number: 1,
              additional_moderators_number: 1,
              population: 27_500,
              allow_sharing: true,
              google_search_console_meta_attribute: 'fake_meta_attribute'
            },
            password_login: {
              allowed: true,
              enabled: true,
              enable_signup: true,
              minimum_length: 8
            },
            facebook_login: {
              allowed: true,
              enabled: true,
              app_id: ENV.fetch('DEFAULT_FACEBOOK_LOGIN_APP_ID'),
              app_secret: ENV.fetch('DEFAULT_FACEBOOK_LOGIN_APP_SECRET')
            },
            google_login: {
              allowed: true,
              enabled: true,
              client_id: ENV.fetch('DEFAULT_GOOGLE_LOGIN_CLIENT_ID'),
              client_secret: ENV.fetch('DEFAULT_GOOGLE_LOGIN_CLIENT_SECRET')
            },
            azure_ad_login: {
              allowed: true,
              enabled: true,
              tenant: ENV.fetch('DEFAULT_AZURE_AD_LOGIN_TENANT_ID'),
              client_id: ENV.fetch('DEFAULT_AZURE_AD_LOGIN_CLIENT_ID'),
              logo_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/microsoft-azure-logo.png',
              login_mechanism_name: 'Azure Active Directory',
              visibility: 'show'
            },
            azure_ad_b2c_login: {
              allowed: true,
              enabled: true,
              tenant_name: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_NAME'),
              tenant_id: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_ID'),
              policy_name: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_POLICY_NAME'),
              client_id: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_CLIENT_ID'),
              logo_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/microsoft-azure-logo.png',
              login_mechanism_name: 'Azure AD B2C'
            },
            id_austria_login: {
              allowed: true,
              enabled: true
            },
            criipto_login: {
              allowed: true,
              enabled: true
            },
            twoday_login: {
              allowed: true,
              enabled: true
            },
            franceconnect_login: {
              allowed: true,
              enabled: false,
              environment: 'integration',
              identifier: ENV.fetch('DEFAULT_FRANCECONNECT_LOGIN_IDENTIFIER'),
              secret: ENV.fetch('DEFAULT_FRANCECONNECT_LOGIN_SECRET')
            },
            hoplr_login: {
              allowed: true,
              enabled: true,
              environment: 'test',
              client_id: ENV.fetch('DEFAULT_HOPLR_CLIENT_ID', 'fake id'),
              client_secret: ENV.fetch('DEFAULT_HOPLR_CLIENT_SECRET', 'fake secret')
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
            maps: {
              enabled: true,
              allowed: true,
              tile_provider: ENV.fetch('DEFAULT_MAPS_TILE_PROVIDER'),
              map_center: {
                lat: '50.8503',
                long: '4.3517'
              },
              zoom_level: 12,
              osm_relation_id: 2_404_021
            },
            esri_integration: {
              enabled: true,
              allowed: true
            },
            custom_maps: {
              enabled: true,
              allowed: true
            },
            custom_accessibility_statement_link: {
              enabled: false,
              allowed: false
            },
            blocking_profanity: {
              enabled: true,
              allowed: true
            },
            user_confirmation: {
              enabled: true,
              allowed: true
            },
            permissions_custom_fields: {
              enabled: true,
              allowed: true
            },
            anonymous_participation: {
              enabled: true,
              allowed: true
            },
            bulk_import_ideas: {
              enabled: true,
              allowed: true
            },
            project_description_builder: {
              enabled: true,
              allowed: true
            },
            custom_idea_statuses: {
              enabled: true,
              allowed: true
            },
            idea_author_change: {
              enabled: true,
              allowed: true
            },
            widgets: {
              enabled: true,
              allowed: true
            },
            granular_permissions: {
              enabled: true,
              allowed: true
            },
            machine_translations: {
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
            planhat: {
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
            konveio_document_annotation: {
              enabled: true,
              allowed: true
            },
            events_widget: {
              enabled: true,
              allowed: true
            },
            polls: {
              enabled: true,
              allowed: true
            },
            verification: {
              enabled: true,
              allowed: true,
              verification_methods: [
                # NOTE: for real platforms, you should never have
                # more than one verification method enabled at a time.
                # The below list is for testing purposes only.
                {
                  name: 'fake_sso'
                },
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
                  ui_method_name: 'Enter social security number',
                  card_id: 'Social security number',
                  card_id_placeholder: 'xx-xxxxx-xx',
                  card_id_tooltip: 'You can find this number on you ID card. We check your number without storing it.',
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
                },
                {
                  name: 'nemlog_in',
                  environment: 'pre_production_integration',
                  issuer: ENV.fetch('DEFAULT_NEMLOG_IN_ISSUER', 'fake issuer'),
                  private_key: ENV.fetch('DEFAULT_NEMLOG_IN_PRIVATE_KEY', 'fake key'),
                  enabled_for_verified_actions: true
                },
                {
                  name: 'criipto',
                  domain: 'cl-test.criipto.id',
                  client_id: ENV.fetch('DEFAULT_CRIIPTO_CLIENT_ID', 'fake id'),
                  client_secret: ENV.fetch('DEFAULT_CRIIPTO_CLIENT_SECRET', 'fake secret'),
                  identity_source: 'DK MitID',
                  ui_method_name: 'MitID (Criipto)'
                },
                {
                  name: 'id_austria',
                  client_id: ENV.fetch('DEFAULT_ID_AUSTRIA_CLIENT_ID', 'fake id'),
                  client_secret: ENV.fetch('DEFAULT_ID_AUSTRIA_CLIENT_SECRET', 'fake secret'),
                  ui_method_name: 'ID Austria',
                  enabled_for_verified_actions: true
                },
                {
                  name: 'twoday',
                  client_id: ENV.fetch('DEFAULT_ID_TWODAY_CLIENT_ID', 'fake id'),
                  client_secret: ENV.fetch('DEFAULT_ID_TWODAY_CLIENT_SECRET', 'fake secret'),
                  domain: ENV.fetch('DEFAULT_ID_TWODAY_DOMAIN', 'fake domain'),
                  ui_method_name: 'Bank ID',
                  enabled_for_verified_actions: true
                }
              ]
            },
            project_folders: {
              enabled: true,
              allowed: true
            },
            project_preview_link: {
              enabled: true,
              allowed: true
            },
            moderation: {
              enabled: true,
              allowed: true
            },
            flag_inappropriate_content: {
              enabled: false,
              allowed: false
            },
            disable_disliking: {
              enabled: true,
              allowed: true
            },
            form_mapping: {
              enabled: true,
              allowed: true
            },
            report_builder: {
              enabled: true,
              allowed: true
            },
            report_data_grouping: {
              enabled: true,
              allowed: true
            },
            input_form_custom_fields: {
              enabled: true,
              allowed: true
            },
            posthog_integration: {
              enabled: false,
              allowed: true
            },
            posthog_user_tracking: {
              enabled: false,
              allowed: true
            },
            user_blocking: {
              enabled: true,
              allowed: true,
              duration: 90
            },
            user_avatars: {
              enabled: true,
              allowed: true
            },
            gravatar_avatars: {
              enabled: true,
              allowed: true
            },
            internal_commenting: {
              enabled: true,
              allowed: true
            },
            follow: {
              enabled: true,
              allowed: true
            },
            public_api_tokens: {
              enabled: true,
              allowed: true
            },
            power_bi: {
              enabled: true,
              allowed: true
            },
            input_importer: {
              enabled: true,
              allowed: true
            },
            import_printed_forms: {
              enabled: true,
              allowed: true
            },
            html_pdfs: {
              enabled: true,
              allowed: true
            },
            user_session_recording: {
              # Disable for E2E tests on localhost
              enabled: false,
              allowed: false
            },
            analysis: {
              enabled: true,
              allowed: true
            },
            large_summaries: {
              enabled: true,
              allowed: true
            },
            ask_a_question: {
              enabled: true,
              allowed: true
            },
            advanced_autotagging: {
              enabled: true,
              allowed: true
            },
            auto_insights: {
              enabled: true,
              allowed: true
            },
            multi_language_platform: {
              enabled: true,
              allowed: true
            },
            customisable_homepage_banner: {
              enabled: true,
              allowed: true
            },
            proposals_participation_method: {
              enabled: true,
              allowed: true
            },
            input_cosponsorship: {
              enabled: true,
              allowed: true
            },
            management_feed: {
              enabled: true,
              allowed: true
            },
            remove_vendor_branding: {
              enabled: false,
              allowed: true
            },
            fake_sso: {
              enabled: true,
              allowed: true,
              issuer: '' # Change this value to 'https://fake-sso.onrender.com' to test with the deployed version of the Fake SSO
            },
            project_review: {
              enabled: true,
              allowed: true
            },
            platform_templates: {
              enabled: false,
              allowed: false
            },
            project_library: {
              enabled: false,
              allowed: false
            },
            community_monitor: {
              enabled: true,
              allowed: true,
              project_id: ''
            },
            user_fields_in_surveys: {
              enabled: true,
              allowed: true
            },
            common_ground: {
              enabled: true,
              allowed: true
            },
            project_planning: {
              enabled: false,
              allowed: false
            }
          })
        )

        TenantService.new.initialize_tenant(tenant_attrs, config_attrs)
      end

      def create_empty_localhost_tenant
        tenant_attrs = {
          id: '07ff8088-cc78-4307-9a1c-ebb6fb836f96',
          name: 'empty',
          host: 'empty.localhost',
          created_at: Faker::Date.between(from: 1.year.ago, to: Time.zone.now)
        }

        config_attrs = tenant_attrs.merge(
          logo: Rails.root.join('spec/fixtures/logo.png').open,
          settings: SettingsService.new.minimal_required_settings(locales: %w[en nl-BE], lifecycle_stage: 'active')
        )

        TenantService.new.initialize_tenant(tenant_attrs, config_attrs)
      end
    end
  end
end
