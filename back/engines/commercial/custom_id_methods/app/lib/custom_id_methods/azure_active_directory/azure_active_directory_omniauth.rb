# frozen_string_literal: true

module CustomIdMethods::AzureActiveDirectory
  class AzureActiveDirectoryOmniauth < IdMethods::Base
    include CustomIdMethods::EmployeeSso

    def name
      'azureactivedirectory'
    end

    def verification?
      false
    end

    def authentication?
      true
    end

    def verification_method_type
      :omniauth
    end

    def id
      '7a610902-304b-4399-9f9e-da68ff478e86'
    end

    def config_parameters
      %i[tenant client_id] + EMPLOYEE_SSO_CONFIG_PARAMETERS
    end

    def config_parameters_schema
      {
        tenant: {
          title: 'Directory (tenant) ID',
          type: 'string',
          private: true
        },
        client_id: {
          title: 'Application (client) ID',
          description: "Sometimes also called 'application_id'",
          type: 'string',
          private: true
        }
      }.merge(employee_sso_config_parameters_schema)
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      env['omniauth.strategy'].options[:client_id] = config[:client_id]
      env['omniauth.strategy'].options[:tenant] = config[:tenant]
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'].presence || auth.info['name'],
        last_name: auth.info['last_name'].presence || auth.info['name'],
        email: auth.info['email'].presence,
        remote_avatar_url: remote_avatar_url(auth),
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    def updateable_user_attrs
      super + %i[remote_avatar_url]
    end

    # Azure AD does not use the email_verified attribute,
    # but only returns emails if they are verified since these
    # are work email addresses.
    # See https://app.notion.com/p/govocal/SSO-ID-verification-Testing-and-dev-set-up-a176dd3e335f47c28f949e5962d32a26#3d69663b7b2680dbbbabd683cc1c8fcd
    def email_confirmed?(auth)
      auth.info['email'].present?
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')

      auth.info['image']
    end
  end
end
