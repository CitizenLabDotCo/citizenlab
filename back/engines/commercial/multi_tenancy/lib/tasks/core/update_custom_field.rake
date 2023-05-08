# frozen_string_literal: true

# Sometimes we update a specific custom field value in our codebase, but not on existing platforms.
# For example, when we update the option for domicile to 'Woonplaats' in Dutch,
# in the back/config/locales/en.yml file, existing platforms with the previous value of 'Verblijfplaats'
# will not be set to the new title_multiloc value.
# This means that templates, which are built from template tenants, will likely continue to include the old value
# until the value is updated for the template tenants, as will new platforms created form such templates.
#
# It's necessary to provide the old default value that needs updating in this task, to avoid updating values
# that have been set to a specific custom value for certain tenants.

namespace :cl2back do
  desc 'Update a specific custom field title_multiloc for one specific locale, for all tenants'
  # Examples of usage:
  # Dry run (no changes): rake cl2back:update_custom_field['domicile','nl-NL','Verblijfplaats','Woonplaats']
  # Execute (updates records!):
  #  rake cl2back:update_custom_field['domicile','nl-NL','Verblijfplaats','Woonplaats','execute']
  task :update_custom_field, %i[field_key locale old_value new_value execute] => [:environment] do |_t, args|
    live_run = true if args[:execute] == 'execute'
    field_key = args[:field_key]
    locale = args[:locale]
    new_value = args[:new_value]
    old_value = args[:old_value]
    n = 0

    puts "live_run: #{live_run ? 'true' : 'false'}"

    Tenant.switch_each do |tenant|
      puts "Processing tenant: #{tenant.name}..."

      field = CustomField.find_by(key: field_key)

      if field&.title_multiloc&.key?(locale) && field.title_multiloc[locale] == old_value
        field.title_multiloc[locale] = new_value
        field.save! if live_run
        n += 1
        puts "Updated option with key: #{field_key}, title_multiloc value for locale: #{locale}; " \
             "#{old_value}, to be: #{new_value}"
      end
    end

    puts "Updated custom field title_multiloc value (for specific locale) for #{n} tenants"
  end
end
