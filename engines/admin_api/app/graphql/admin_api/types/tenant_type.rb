module AdminApi
  class Types::TenantType < GraphQL::Schema::Object
    description "A CitizenLab platform"

    class TenantSettingsSchema < GraphQL::Schema::Object
      field :facebook_login_app_id, String, null: true
      def facebook_login_app_id
        object.dig('facebook_login', 'app_id')
      end

      field :facebook_login_app_secret, String, null: true
      def facebook_login_app_secret
        object.dig('facebook_login', 'app_secret')
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
    end

    field :id, ID, null: false
    field :name, String, null: false
    field :host, String, null: false
    field :settings, TenantSettingsSchema, null: false

  end
end