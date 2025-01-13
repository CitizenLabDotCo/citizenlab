require 'json'

namespace :custom_fields do
  desc 'Sets code: null for education custom fields'
  task :set_education_code_null, [] => [:environment] do
    # Reduce logging when developing (to more closely match the production environment)
    # dev_null = Logger.new('/dev/null')
    # Rails.logger = dev_null
    # ActiveRecord::Base.logger = dev_null

    reporter = ScriptReporter.new
    Tenant.safe_switch_each do |tenant|
      puts "\nProcessing tenant #{tenant.host} \n\n"

      field = CustomField.find_by(code: 'education')
      original_field = field.deep_dup

      if field
        if field.update(code: nil)
          reporter.add_change(
            original_field.attributes,
            field.attributes,
            context: { tenant: tenant.host }
          )
        else
          reporter.add_error(
            field.errors.details,
            context: { tenant: tenant.host }
          )
        end
      else
        puts "Custom field 'education' not found for tenant #{tenant.host}"
      end

      reporter.report!('set_education_code_null.json', verbose: true)
    end
  end
end
