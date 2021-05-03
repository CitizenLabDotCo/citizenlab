module AppConfigurationHelper
  def enable_phone_login
    settings = AppConfiguration.instance.settings
    settings.merge!(
      'password_login' => {
        'phone' => true,
        'enabled' => true,
        'allowed' => true,
        'phone_email_pattern' => 'phone+__PHONE__@test.com'
      }
    )

    AppConfiguration.instance.update!(settings: settings)
  end
end
