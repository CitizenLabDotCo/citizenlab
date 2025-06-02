# frozen_string_literal: true

namespace :cl2_back do
  desc 'Create a tenant with given host and optional template'
  task :create_tenant, %i[host template locales] => [:environment] do |_t, args|
    host = args[:host] || raise("Please provide the 'host' arg")
    tenant_template = args[:template] || 'e2etests_template'
    Tenant.find_by(host: host)&.destroy!

    settings = SettingsService.new.minimal_required_settings(
      locales: args[:locales]&.split(';')&.map(&:strip) || %w[en nl-BE nl-NL fr-BE],
      lifecycle_stage: 'not_applicable'
    ).deep_merge(
      {
        core: {
          organization_name: {
            'en' => 'Wonderville',
            'nl-BE' => 'Mirakelgem'
          },
          signup_helper_text: {
            en: 'If you don\'t want to register, use hello@govocal.com/democrazy as email/password'
          },
          maximum_admins_number: 2,
          maximum_moderators_number: 2,
          additional_admins_number: 2,
          additional_moderators_number: 1,
          allow_sharing: true
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
        custom_maps: {
          enabled: true,
          allowed: true
        },
        esri_integration: {
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
        custom_idea_statuses: {
          enabled: true,
          allowed: true
        },
        idea_author_change: {
          enabled: true,
          allowed: true
        },
        blocking_profanity: {
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
        password_login: {
          enabled: true,
          allowed: true,
          enable_signup: true,
          minimum_length: 8
        },
        pages: {
          allowed: true,
          enabled: true
        },
        intercom: {
          enabled: true,
          allowed: true
        },
        community_monitor: {
          enabled: true,
          allowed: true
        },
        segment: {
          enabled: true,
          allowed: true
        },
        planhat: {
          enabled: false,
          allowed: false
        },
        satismeter: {
          enabled: false,
          allowed: true
        },
        google_analytics: {
          enabled: false,
          allowed: true
        },
        google_tag_manager: {
          enabled: false,
          allowed: false
        },
        matomo: {
          enabled: true,
          allowed: true,
          product_site_id: ENV.fetch('MATOMO_PRODUCT_SITE_ID', ''),
          tenant_site_id: ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID', '')
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
        survey_xact_surveys: {
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
              name: 'fake_sso'
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
        project_description_builder: {
          enabled: true,
          allowed: true
        },
        smart_groups: {
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
        disable_disliking: {
          enabled: true,
          allowed: true
        },
        report_builder: {
          enabled: true,
          allowed: true
        },
        input_form_custom_fields: {
          enabled: true,
          allowed: true
        },
        form_mapping: {
          enabled: true,
          allowed: true
        },
        posthog_integration: {
          enabled: false,
          allowed: false
        },
        posthog_user_tracking: {
          enabled: false,
          allowed: false
        },
        user_blocking: {
          enabled: false,
          allowed: false,
          duration: 90
        },
        public_api_tokens: {
          enabled: true,
          allowed: true
        },
        internal_commenting: {
          enabled: false,
          allowed: false
        },
        follow: {
          enabled: true,
          allowed: true
        },
        user_session_recording: {
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
        report_data_grouping: {
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
        common_ground: {
          enabled: true,
          allowed: true
        },
        project_planning: {
          enabled: true,
          allowed: true
        }
      }
    )

    tenant_attrs = { name: host, host: host }
    config_attrs = {
      logo: Rails.root.join('spec/fixtures/logo.png').open,
      settings: settings
    }.with_indifferent_access

    _success, tenant, _app_config = MultiTenancy::TenantService.new.initialize_with_template(
      tenant_attrs, config_attrs, tenant_template, apply_template_sync: true
    )

    tenant.switch do
      UserService.create_in_tenant_template!(
        roles: [{ type: 'admin' }],
        first_name: 'Citizen',
        last_name: 'Lab',
        email: 'hello@govocal.com',
        password: 'democrazy',
        locale: tenant.configuration.settings('core', 'locales')&.first || 'en',
        registration_completed_at: Time.zone.now
      )
      admin = User.find_by(email: 'admin@govocal.com')
      UserService.update_in_tenant_template!(admin) if admin
      Analytics::PopulateDimensionsService.run
    end

    MultiTenancy::TenantService.new.finalize_creation(tenant)
  end
end
