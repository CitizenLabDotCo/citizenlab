# Reloads the CL_SETTING_* environment variables
# into the current app configuration.

begin
  if !CitizenLab.ee? && !Rails.env.test? && ActiveRecord::Base.connection.table_exists?(AppConfiguration.table_name)
    config = AppConfiguration.instance
    settings = config.settings

    config.host = ENV.fetch('CL_SETTINGS_HOST') if ENV.fetch('CL_SETTINGS_HOST', false)
    
    settings['core']['timezone'] = ENV.fetch('CL_SETTINGS_CORE_TIMEZONE') if ENV.fetch('CL_SETTINGS_CORE_TIMEZONE', false)
    settings['core']['currency'] = ENV.fetch('CL_SETTINGS_CORE_CURRENCY') if ENV.fetch('CL_SETTINGS_CORE_CURRENCY', false)
    settings['core']['reply_to_email'] = ENV.fetch('DEFAULT_FROM_EMAIL') if ENV.fetch('DEFAULT_FROM_EMAIL', false)

    settings['facebook_login']['enabled'] = (ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_ENABLED') == 'true') if ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_ENABLED', false)
    settings['facebook_login']['allowed'] = (ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_ENABLED') == 'true') if ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_ENABLED', false)
    settings['facebook_login']['app_id'] = ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_ID') if ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_ID', false)
    settings['facebook_login']['app_secret'] = ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_SECRET') if ENV.fetch('CL_SETTINGS_FACEBOOK_LOGIN_APP_SECRET', false)

    settings['google_login']['enabled'] = (ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_ENABLED') == 'true') if ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_ENABLED', false)
    settings['google_login']['allowed'] = (ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_ENABLED') == 'true') if ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_ENABLED', false)
    settings['google_login']['client_id'] = ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_ID') if ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_ID', false)
    settings['google_login']['client_secret'] = ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_SECRET') if ENV.fetch('CL_SETTINGS_GOOGLE_LOGIN_CLIENT_SECRET', false)

    settings['maps']['map_center']['lat'] = ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LAT') if ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LAT', false)
    settings['maps']['map_center']['long'] = ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LONG') if ENV.fetch('CL_SETTINGS_MAPS_MAP_CENTER_LONG', false)
    settings['maps']['zoom_level'] = ENV.fetch('CL_SETTINGS_MAPS_ZOOM_LEVEL').to_i if ENV.fetch('CL_SETTINGS_MAPS_ZOOM_LEVEL', false)

    begin
      config.save!
    rescue Exception => e
      logger = Rails.logger
      logger.error 'Failed to reload environment variables into the seeded data.'
      logger.error e.message
      e.backtrace.each { |line| logger.error line }
    end
  end
rescue ActiveRecord::NoDatabaseError
  # rescue case where initializer is executed within db:create rake task
rescue ActiveRecord::RecordNotFound
  # rescue case where app_configuration doesn't exist yet in db:seed rake task
end
