namespace :fix_existing_tenants do
  desc "Convert all user emails to all lowercase characters"
  task :downcase_user_emails => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        User.all.each do |user|
          user.update_columns(email: user.email.downcase) if user.email
        end
      end
    end
  end
end