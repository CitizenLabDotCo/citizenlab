
namespace :fix_existing_tenants do
  
  desc "Identify all users of all tenants"
  task :identify_all => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.host.gsub('.', '_')) do
        User.all.each do |user|
          IdentifyToSegmentJob.perform_later(user)
        end
      end
    end
  end

end
