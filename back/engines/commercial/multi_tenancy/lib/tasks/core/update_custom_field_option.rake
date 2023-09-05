# frozen_string_literal: true

# Sometimes we update a specific custom field option value in our codebase, but not on existing platforms.
# For example, when we update the option for unspecified gender to 'Divers' in German,
# in the back/config/locales/en.yml file, existing platforms with the previous value of 'unspezifiziert'
# will not be set to the new value.
# This means that templates, which are built from template tenants, will likely continue to include the old value
# until the value is updated for the template tenants, as will new platforms created form such templates.
#
# It's necessary to provide the old default value that needs updating in this task, to avoid updating values
# that have been set to a specific custom value for certain tenants.

namespace :cl2back do
  desc 'Update a specific custom field option title_multiloc for one specific locale, for all tenants'
  # Examples of usage:
  # Dry run (no changes): rake cl2back:update_custom_field_option['unspecified','de-DE','unspezifiziert','Divers']
  # Execute (updates records!):
  #  rake cl2back:update_custom_field_option['unspecified','de-DE','unspezifiziert','Divers','execute']
  task :update_custom_field_option, %i[option_key locale old_value new_value execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    option_key = args[:option_key]
    locale = args[:locale]
    new_value = args[:new_value]
    old_value = args[:old_value]
    n = 0

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Tenant.switch_each do |tenant|
      puts "Processing tenant: #{tenant.name}..."

      option = CustomFieldOption.find_by(key: option_key)

      if option&.title_multiloc&.key?(locale) && option.title_multiloc[locale] == old_value
        option.title_multiloc[locale] = new_value
        option.save! if live_run
        n += 1
        puts "Updated option with key: #{option_key}, title_multiloc value for locale: #{locale}; " \
             "#{old_value}, to be: #{new_value}"
      end
    end

    puts "Updated custom field option value (for specific locale) for #{n} tenants"
  end

  # This task will update ANY existing value for a specific locale, for all tenants.
  desc 'Update a specific custom field option title_multiloc, from ANY VALUE, for one specific locale, for all tenants'
  # Examples of usage:
  # Dry run (no changes): rake cl2back:update_custom_field_option_from_any_value['unspecified','de-DE','Divers']
  # Execute (updates records!):
  #  rake cl2back:update_custom_field_option_from_any_value['unspecified','de-DE','Divers','execute']
  task :update_custom_field_option_from_any_value, %i[option_key locale new_value execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    option_key = args[:option_key]
    locale = args[:locale]
    new_value = args[:new_value]
    n = 0

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Tenant.switch_each do |tenant|
      puts "Processing tenant: #{tenant.name}..."

      option = CustomFieldOption.find_by(key: option_key)

      if option&.title_multiloc&.key?(locale) && option.title_multiloc[locale] != new_value
        old_value = option.title_multiloc[locale]
        option.title_multiloc[locale] = new_value
        option.save! if live_run
        n += 1
        puts "Updated option with key: #{option_key}, title_multiloc value for locale: #{locale}; " \
             "#{old_value}, to be: #{new_value}"
      end
    end

    puts "Updated custom field option value (for specific locale) for #{n} tenants"
  end
end
