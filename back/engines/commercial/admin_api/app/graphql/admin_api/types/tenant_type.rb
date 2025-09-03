# frozen_string_literal: true

module AdminApi
  class Types::TenantType < GraphQL::Schema::Object
    description 'A Go Vocal platform'

    class TenantLogo < GraphQL::Schema::Object
      field :small_url, String, null: false
      def small_url
        object.versions[:small]
      end

      field :medium_url, String, null: false
      def medium_url
        object.versions[:medium]
      end

      field :large_url, String, null: false
      def large_url
        object.versions[:large]
      end
    end

    class TenantSettingsSchema < GraphQL::Schema::Object
      field :facebook_login_app_id, String, null: true
      def facebook_login_app_id
        object.dig('facebook_login', 'app_id')
      end

      field :facebook_login_app_secret, String, null: true
      def facebook_login_app_secret
        object.dig('facebook_login', 'app_secret')
      end

      field :integration_onze_stad_app_allowed, Boolean, null: true
      def integration_onze_stad_app_allowed
        object.dig('integration_onze_stad_app', 'allowed')
      end

      field :integration_onze_stad_app_enabled, Boolean, null: true
      def integration_onze_stad_app_enabled
        object.dig('integration_onze_stad_app', 'enabled')
      end

      field :integration_onze_stad_app_app_id, String, null: true
      def integration_onze_stad_app_app_id
        object.dig('integration_onze_stad_app', 'app_id')
      end

      field :integration_onze_stad_app_api_key, String, null: true
      def integration_onze_stad_app_api_key
        object.dig('integration_onze_stad_app', 'api_key')
      end

      field :core_locales, [String], null: false
      def core_locales
        object.dig('core', 'locales')
      end

      field :core_organization_name, Types::MultilocType, null: false
      def core_organization_name
        object.dig('core', 'organization_name')
      end

      field :core_color_main, String, null: false
      def core_color_main
        object.dig('core', 'color_main')
      end

      field :ideas_overview_allowed, Boolean, null: false
      def ideas_overview_allowed
        object.dig('ideas_overview', 'allowed')
      end

      field :ideas_overview_enabled, Boolean, null: false
      def ideas_overview_enabled
        object.dig('ideas_overview', 'enabled')
      end

      field :project_folders_allowed, Boolean, null: false
      def project_folders_allowed
        object.dig('project_folders', 'allowed')
      end

      field :project_folders_enabled, Boolean, null: false
      def project_folders_enabled
        object.dig('project_folders', 'enabled')
      end
    end

    field :id, ID, null: false
    field :name, String, null: false
    field :host, String, null: false
    field :logo, TenantLogo, null: true
    field :settings, TenantSettingsSchema, null: false

    def logo
      object.configuration.logo
    end

    def settings
      object.configuration.settings
    end
  end
end
