class TrackUserJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform(user)
    tenant = Tenant.current
    TrackIntercomService.new.identify_user(user, tenant) if AppConfiguration.instance.has_feature?('intercom')
    TrackSegmentService.new.identify_user(user) if AppConfiguration.instance.has_feature?('segment')
  rescue ActiveRecord::RecordNotFound
    # Ignored
  end
end
