namespace :cl2back do
  desc "Execute recurrent behaviour such as automatic status changes or periodic notifications"
  task :hourly => [:environment] do |t, args|
    now = Time.now
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        AutomatedTransitionJob.perform_later
        CreatePeriodicActivitiesJob.perform_later now.to_i
      end
    end
  end
end