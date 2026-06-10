namespace :single_use do
  desc 'verification and verification_methods -> id_config and id_methods'
  task :copy_verification_settings, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    puts "---------- STARTING TASK: Copy verification settings ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    Tenant.safe_switch_each do |tenant|
      settings = AppConfiguration.instance.settings
      verification_methods = settings.dig('verification', 'verification_methods')

      if verification_methods.present?
        puts "Tenant: #{tenant.name}"
        puts "Current verification settings: #{verification_methods}"

        if execute
          settings['id_config'] ||= {}
          settings['id_config']['id_methods'] = verification_methods
          AppConfiguration.instance.update!(settings: settings)
          puts 'Updated id_config with verification methods.'
        else
          puts 'Dry run - id_config would be updated with verification methods.'
        end

        puts "\n"
      else
        puts "Tenant: #{tenant.name} - No verification methods found, skipping.\n\n"
      end
    end
  end
end
