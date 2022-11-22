# frozen_string_literal: true

module AppConfigurationHelper
  def enable_phone_login
    settings = AppConfiguration.instance.settings
    settings['password_login'] = {
      'enabled' => true,
      'allowed' => true,
      'enable_signup' => true,
      'phone' => true,
      'phone_email_pattern' => 'phone+__PHONE__@test.com',
      'minimum_length' => 8
    }

    AppConfiguration.instance.update!(settings: settings)
  end
end
