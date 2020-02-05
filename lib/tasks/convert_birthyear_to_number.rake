
namespace :fix_existing_tenants do
  desc "Converts the custom_field for birthyear and the values in the user from string to integer."
  task :convert_birthyear_to_number => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        puts "Processing tenant #{tenant.host}..."

        # Convert the field definition
        birthyear_field = CustomField.with_resource_type('User').find_by(code: 'birthyear')
        birthyear_field.update_column('input_type', 'number')

        # Convert the user values
        User.all.each do |user|
          custom_field_values = user.custom_field_values
          birthyear = custom_field_values['birthyear']
          if birthyear.present? && birthyear.kind_of?(String)
            custom_field_values['birthyear'] = birthyear.to_i
            user.update_column('custom_field_values', custom_field_values)
          end
        end

      end
    end
  end
end