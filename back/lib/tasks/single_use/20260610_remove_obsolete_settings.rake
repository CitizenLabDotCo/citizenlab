namespace :single_use do
  desc 'remove obsolete verification, facebook_login, google_login, azure_ad_login and azure_ad_b2c_login settings'
  task :remove_obsolete_settings, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Remove obsolete settings ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    Tenant.safe_switch_each do |tenant|
      settings = AppConfiguration.instance.settings

      if execute
        settings.delete('verification') if settings.key?('verification')
        settings.delete('facebook_login') if settings.key?('facebook_login')
        settings.delete('google_login') if settings.key?('google_login')
        settings.delete('azure_ad_login') if settings.key?('azure_ad_login')
        settings.delete('azure_ad_b2c_login') if settings.key?('azure_ad_b2c_login')
        AppConfiguration.instance.update!(settings: settings)
        puts "Tenant: #{tenant.name} - Obsolete settings removed."
      else
        puts "Tenant: #{tenant.name} - Dry run - obsolete settings would be removed."
      end
    end
  end
end
