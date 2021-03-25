module Surveys
  class WebhookManagerJob < ApplicationJob
    queue_as :default

    def run(action, *args)
      service = TypeformWebhookManager.new
      service.send(action, *args)
    end

  end
end
