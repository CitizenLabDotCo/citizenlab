# Usage:
#
# Dry run: rake single_use:remove_old_helper_texts
# Execute: rake single_use:remove_old_helper_texts[execute]
OLD_LOGIN_HELPER_TEXT = 'login_helper_text'
OLD_SIGNUP_HELPER_TEXT = 'signup_helper_text'

namespace :single_use do
  desc 'Remove old helper texts'
  task :remove_old_helper_texts, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'

    puts "\n\n"

    if execute
      puts "Executing: changes will be made\n\n"
    else
      puts "Dry run: no changes will be made\n\n"
    end

    def report_removal(tenant, text)
      puts "\n\nRemoving #{text} for tenant #{tenant.host}\n\n"
    end

    Tenant.safe_switch_each do |tenant|
      app_config = AppConfiguration.instance
      settings = app_config.settings.deep_dup # Create a deep copy
      core = settings['core']

      login_text_present = core[OLD_LOGIN_HELPER_TEXT].present?
      signup_text_present = core[OLD_SIGNUP_HELPER_TEXT].present?

      if login_text_present || signup_text_present
        report_removal(tenant, OLD_LOGIN_HELPER_TEXT) if login_text_present
        report_removal(tenant, OLD_SIGNUP_HELPER_TEXT) if signup_text_present

        settings['core'].delete(OLD_LOGIN_HELPER_TEXT) if login_text_present
        settings['core'].delete(OLD_SIGNUP_HELPER_TEXT) if signup_text_present

        if execute
          app_config.settings = settings
          app_config.save!
          puts "\n\nSaved changes for tenant #{tenant.host}\n\n"
        end
      else
        puts "\n\nNo old helper texts found for tenant #{tenant.host}\n\n"
      end
    end

    puts "\n\nDone!\n\n"
  end
end
