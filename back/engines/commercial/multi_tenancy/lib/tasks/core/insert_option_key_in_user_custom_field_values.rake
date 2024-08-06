# This rake task is designed specifically to insert custom_field key: custom_field_option key value pairs
# into the user.custom_field_values, if given a value for the user that matches (after sanitization) the
# existing respective custom_field_option multiloc value.
# The task is designed only for single-locale tenants.
#
# The planned usage is for re-inserting values after a custom_field of a text registration question has been removed
# and replaced with a single-select option question.
# The task assumes that the values have been exported from the database, probably before the related custom_field was
# deleted, which would result in the loss of the respective data from the user.custom_field_values.
# This commonly happens when a postcode text-input field is replaced with a postcode single-select field.
#
# Example:
# Given a CSV file with the following headers: 'id,value', where id is the User ID and value is the value
# to be checked against existing custom_field_option values.

# $ rake cl2_back:insert_option_key_in_user_custom_field_values['/user_values.csv','cqc.citizenlab.co','custom_field_id','execute]

namespace :cl2_back do
  desc 'Insert option key-value pairs to user custom_field_values hashes.'
  task :insert_option_key_in_user_custom_field_values, %i[execute url host custom_field_id locale] => [:environment] do |_t, args|
    data = CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
    custom_field = CustomField.find_by(id: args[:custom_field_id])

    if custom_field.nil?
      puts "ERROR: Couldn't find custom_field with id #{args[:custom_field_id]}"
      next

    end

    options = custom_field.options
    execute = args[:execute] == 'execute'
    locale = args[:locale] || AppConfiguration.instance.settings.dig('core', 'locales').first
    count = 0

    puts 'DRY RUN' unless execute

    Apartment::Tenant.switch(args[:host].tr('.', '_')) do
      data.each do |d|
        next if d['value'].nil?

        user = User.find_by(id: d['id'])
        next if user.nil? || user.custom_field_values[custom_field.key].present?

        value = d['value'].delete(' ').downcase
        option = options.find { |o| o.title_multiloc[locale].downcase == value }

        if option
          puts "Updating custom_field_value '#{custom_field.key}': '#{option.key}' for user.id #{user.id}."
          cfv = user.custom_field_values
          cfv[custom_field.key] = option.key

          if execute
            user.update!(custom_field_values: cfv)
            count += 1
          end
        else
          puts "No option matched to value '#{d['value']}' for user.id #{user.id}."
        end
      end
    end
  end
end
