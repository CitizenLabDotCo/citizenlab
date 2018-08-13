class PublishRawEventToSegmentJob < ApplicationJob
  queue_as :default

  def perform(event)
    Analytics.track(event) if Analytics
  end

end
