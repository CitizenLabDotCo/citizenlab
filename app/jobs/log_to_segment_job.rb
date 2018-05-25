class LogToSegmentJob < ApplicationJob
  queue_as :default

  def perform(activity)
    event = LogToSegmentService.new.tracking_message_for_activity activity
    Analytics.track(event) if event
  end

end
