class PublishRawEventJob < ApplicationJob
  queue_as :default

  def perform(event, routing_key:)
    PublishRawEventToSegmentJob.perform_later(event)
    PublishRawEventToRabbitJob.perform_later(event, routing_key)
  end

end
