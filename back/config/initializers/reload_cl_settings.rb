# Reloads the CL_SETTING_* environment variables
# into the current seed data.

if !CitizenLab.ee?
  config = AppConfiguration.instance
  config.host = ENV.fetch('CL_SETTINGS_HOST') if ENV.fetch('CL_SETTINGS_HOST')
  # config.host = ENV.fetch('CL_SETTINGS_HOST') if ENV.fetch('CL_SETTINGS_HOST')
  # config.host = ENV.fetch('CL_SETTINGS_HOST') if ENV.fetch('CL_SETTINGS_HOST')
  # config.host = ENV.fetch('CL_SETTINGS_HOST') if ENV.fetch('CL_SETTINGS_HOST')
  if !config.save
    puts "Eeeeeerrrrrrrooooooorrrrrrrr!!!!"
  end
end