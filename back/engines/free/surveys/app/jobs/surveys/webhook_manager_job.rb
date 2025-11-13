# frozen_string_literal: true

module Surveys
  class WebhookManagerJob < ApplicationJob
    queue_as :default

    def run(action, *)
      service = TypeformWebhookManager.new
      service.send(action, *)
    end
  end
end
