class TrackUserJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform(user)
    return unless (tenant = Tenant.current)
    TrackIntercomService.new.identify_user(user, tenant) if tenant.has_feature?('intercom')
    TrackSegmentService.new.identify_user(user) if tenant.has_feature?('segment')
  rescue ActiveRecord::RecordNotFound
    # Ignored
  end
end
