module Surveys
  class WebhookManagerJob < ApplicationJob
    queue_as :default

    def perform(action, *args)
      service = TypeformWebhookManager.new
      service.send(action, *args)
    end

  end
end