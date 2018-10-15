namespace :fix_existing_tenants do
  desc "Merge all users for whom the emails are case insensitively equal"
  task :merge_users_by_cimail => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        emails = Users.all.pluck(:email).map(&:downcase)
        emails = emails.select do |email| 
          emails.count(email) > 1 
        end.uniq
        emails.each do |email|
          users = User.where('lower(email) = lower(?)', email)
          # 
        end
      end
    end
  end
end