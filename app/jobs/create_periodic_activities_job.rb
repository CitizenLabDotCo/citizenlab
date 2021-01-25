class CreatePeriodicActivitiesJob < ApplicationJob
  queue_as :default

  def run now
    ActivitiesService.new.create_periodic_activities_for_current_tenant now: now
  end

end
