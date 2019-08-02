namespace :cl2back do
  desc "Execute recurrent behaviour such as automatic status changes or periodic notifications"
  task :hourly => [:environment] do |t, args|
    now = Time.now
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        InitiativeStatusService.new.automated_transitions!
        ActivitiesService.new.create_periodic_activities_for_current_tenant now: now
      end
    end
  end
end