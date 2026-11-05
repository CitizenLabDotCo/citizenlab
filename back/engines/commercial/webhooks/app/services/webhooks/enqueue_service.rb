# frozen_string_literal: true

module Webhooks
  class EnqueueService
    def call(activity)
      event_type = routing_key(activity)

      # Only process supported event types
      return unless Webhooks::Subscription::SUPPORTED_EVENTS.include?(event_type)

      # Find matching subscriptions (event type + optional project filter)
      subscriptions = Webhooks::Subscription
        .enabled
        .for_event(event_type)
        .for_project(activity.project_id)

      # Create delivery records and enqueue jobs
      subscriptions.find_each do |subscription|
        next unless subscription.matches_event?(event_type)
        next unless subscription.matches_project?(activity.project_id)

        delivery = Webhooks::Delivery.create!(
          subscription: subscription,
          activity: activity,
          event_type: event_type,
          status: 'pending'
        )
        Webhooks::DeliveryJob.perform_later(delivery)
      end
    end

    private

    def routing_key(activity)
      "#{activity.item_type.underscore}.#{activity.action.underscore}"
    end
  end
end
