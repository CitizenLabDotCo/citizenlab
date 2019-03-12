namespace :activities do
  desc "Create periodic activities (e.g. Phase started)."
  task :create_periodic_activities => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        ActivitiesService.new.create_periodic_activities_for_current_tenant
      end
    end
  end
end