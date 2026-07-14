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
            permissions_custom_fields: {
              enabled: true,
              allowed: true
            },
            anonymous_participation: {
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
            granular_permissions: {
              enabled: true,
              allowed: true
            },
            machine_translations: {
              enabled: true,
              allowed: true
            },
            intercom: {
              enabled: false,
              allowed: false
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
            polls: {
              enabled: true,
              allowed: true
            },
            id_config: {
              allowed: true,
              enabled: true,
              id_methods: [
                # The built-in authentication methods (Facebook, Google, Azure AD,
                # Azure AD B2C) and Fake SSO are seeded by default. To enable other
                # verification/authentication methods locally, use: rake dev:enable_id_method[<method_name>]
                {
                  name: 'fake_sso'
                },
                {
                  name: 'facebook',
                  app_id: ENV.fetch('DEFAULT_FACEBOOK_LOGIN_APP_ID'),
                  app_secret: ENV.fetch('DEFAULT_FACEBOOK_LOGIN_APP_SECRET')
                },
                {
                  name: 'google',
                  client_id: ENV.fetch('DEFAULT_GOOGLE_LOGIN_CLIENT_ID'),
                  client_secret: ENV.fetch('DEFAULT_GOOGLE_LOGIN_CLIENT_SECRET')
                },
                {
                  name: 'azureactivedirectory',
                  tenant: ENV.fetch('DEFAULT_AZURE_AD_LOGIN_TENANT_ID'),
                  client_id: ENV.fetch('DEFAULT_AZURE_AD_LOGIN_CLIENT_ID'),
                  logo_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/microsoft-azure-logo.png',
                  login_mechanism_name: 'Azure Active Directory',
                  visibility: 'show'
                },
                {
                  name: 'azureactivedirectory_b2c',
                  tenant_name: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_NAME'),
                  tenant_id: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_ID'),
                  policy_name: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_POLICY_NAME'),
                  client_id: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_CLIENT_ID'),
                  logo_url: 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/microsoft-azure-logo.png',
                  login_mechanism_name: 'Azure AD B2C'
                }
              ]
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
            prescreening_flagged_only: {
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
            project_review: {
              enabled: true,
              allowed: true
            },
            project_scheduling: {
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
            idea_feed: {
              enabled: true,
              allowed: true
            },
            nested_input_topics: {
              enabled: true,
              allowed: true
            },
            live_auto_input_topics: {
              enabled: true,
              allowed: true
            },
            data_repository_transcription: {
              enabled: true,
              allowed: true
            },
            data_repository_ai_analysis: {
              enabled: true,
              allowed: true
            },
            project_planning_calendar: {
              enabled: true,
              allowed: true
            },
            customised_automated_emails: {
              enabled: true,
              allowed: true
            },
            customised_automated_context_emails: {
              enabled: true,
              allowed: true
            },
            project_importer: {
              enabled: true,
              allowed: true
            },
            participation_location_tracking: {
              enabled: false,
              allowed: false
            },
            spaces: {
              enabled: false,
              allowed: false
            },
            mcp_server: {
              enabled: true,
              allowed: true
            },
            html_block_in_content_builder: {
              enabled: true,
              allowed: true
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
