namespace :single_use do
  desc 'Migrate EngagementHQ demographics'
  task :migrate_engagementhq_demographics, %i[host csvpath] => :environment do |_task, args|
    reporter = ScriptReporter.new
    Tenant.find_by(host: args[:host]).switch do
      csv = CSV.read(args[:csvpath], headers: true)
      csv.each do |row|
        user = User.find_by(email: row['Email address']&.strip)
        next if !user

        custom_field_values = {}

        birthyear = row['Year of Birth']&.strip&.to_i
        custom_field_values['birthyear'] = birthyear if birthyear.present?

        custom_field_values['postal_code_s0n'] = row['Postal Code']&.strip if row['Postal Code'].present?

        connection_options = rake_20250822_find_option_keys(
          row['Connections to New Westminster (select all that apply)']&.strip,
          CustomField.find_by(key: 'connections_to_new_westminster_select_all_that_apply_320').options
        )
        custom_field_values['connections_to_new_westminster_select_all_that_apply_320'] = connection_options if connection_options.present?

        more_info_options = rake_20250822_find_option_keys(
          row['OPTIONAL - More info about you (select any / all that apply):']&.strip,
          CustomField.find_by(key: 'optional_more_info_about_you_select_any_all_that_apply_snh').options
        )
        custom_field_values['optional_more_info_about_you_select_any_all_that_apply_snh'] = more_info_options if more_info_options.present?

        custom_field_values_before = user.custom_field_values
        custom_field_values.merge!(custom_field_values_before)
        if user.update(custom_field_values: custom_field_values)
          reporter.add_change(
            { custom_field_values: custom_field_values_before },
            { custom_field_values: },
            context: { tenant: Tenant.current.host, user: user.id }
          )
        else
          reporter.add_error(
            user.errors.details,
            context: { tenant: Tenant.current.host, user: user.id, custom_field_values: }
          )
        end
      end
    end
    reporter.report!('migrate_engagementhq_demographics.json', verbose: true)
  end
end

def rake_20250822_find_option_keys(value, options)
  return [] if !value

  options.select { |option| option.title_multiloc.values.any? { |option_value| value.include?(option_value) } }.map(&:key)
end
