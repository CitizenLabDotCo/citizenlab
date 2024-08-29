# This rake task is designed specifically to insert custom_field key: custom_field_option key value pairs
# into the user.custom_field_values, if given a value for the user matches (after sanitization) an
# existing related custom_field_option multiloc value.
# The task is designed only for single-locale tenants.
#
# The planned usage is for re-inserting values after a custom_field of a text registration question has been removed
# and replaced with a single-select option question. Typically, this would be used for postcode-like values.
#
# The task assumes that the values have been exported from the database, probably before the related custom_field was
# deleted, which would result in the loss of the respective data from the user.custom_field_values.
#
# The task always uses the first locale in the core locales list as the locale for the custom_field_option titles.
# This will probably work even on multi-locale tenants when the options are postcode-like values, but care should
# be taken when using this task on multi-locale tenants, and local testing is recommended.
#
# A dry run can be performed by passing anything other than 'execute' as the last argument, or by omitting it.
#
# Example:
# Given a CSV file with the following headers: 'id,value', where id is the User ID and value is the value
# to be checked against existing custom_field_option values.
#
# $ rake cl2_back:insert_option_key_values_in_user_custom_field_values['/user_values.csv','cqc.citizenlab.co','custom_field_id','execute']
namespace :cl2_back do
  desc 'Insert option key-value pairs to user custom_field_values hashes.'
  task :insert_option_key_values_in_user_custom_field_values, %i[url host custom_field_id execute] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])

    execute = args[:execute] == 'execute'
    count = 0
    errors = []

    puts 'DRY RUN' unless execute

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first
      custom_field = CustomField.find_by(id: args[:custom_field_id])

      if custom_field.nil?
        puts "ERROR: Couldn't find custom_field with id #{args[:custom_field_id]}"
        next

      end

      options = custom_field.options

      data.each do |d|
        next if d['value'].nil?

        user = User.find_by(id: d['id'])
        next if user.nil? || user.custom_field_values[custom_field.key].present?

        value = d['value'].delete(' ').strip.downcase
        option = options.find { |o| o.title_multiloc[locale].downcase == value }

        if option
          puts "Updating custom_field_value '#{custom_field.key}': '#{option.key}' for user.id #{user.id}."
          cfv = user.custom_field_values
          cfv[custom_field.key] = option.key

          next unless execute

          if user.update(custom_field_values: cfv)
            count += 1
            puts "  success!\n"
          else
            puts "Couldn't update user.id #{user.id}."
            errors << { user_id: user.id, errors: user.errors.details }
          end
        else
          puts "No option matched to value '#{d['value']}' for user.id #{user.id}."
        end
      end
    end

    puts "Updated #{count} user.custom_field_values."

    if errors.any?
      puts 'Errors:'
      puts errors
    else
      puts 'No errors.'
    end
  end
end
