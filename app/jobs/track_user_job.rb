class TrackUserJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def run(user)
    TrackIntercomService.new.identify_user(user) if AppConfiguration.instance.has_feature?('intercom')
    TrackSegmentService.new.identify_user(user)  if AppConfiguration.instance.has_feature?('segment')
  end
end
