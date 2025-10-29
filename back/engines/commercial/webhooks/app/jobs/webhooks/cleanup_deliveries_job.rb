# frozen_string_literal: true

module Webhooks
  class CleanupDeliveriesJob < ApplicationJob
    self.priority = 90 # very low priority

    def perform
      # Delete successful deliveries older than 30 days
      deleted_success = Webhooks::Delivery.succeeded
        .older_than(30.days.ago)
        .delete_all

      # Delete failed deliveries older than 30 days
      deleted_failed = Webhooks::Delivery.failed
        .older_than(30.days.ago)
        .delete_all

      Rails.logger.info(
        "Cleaned up webhook deliveries: #{deleted_success} successful, #{deleted_failed} failed"
      )
    end
  end
end
