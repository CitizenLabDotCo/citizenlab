# frozen_string_literal: true

class PublishGenericEventToRabbitJob < ApplicationJob
  queue_as :default

  # @param [Hash] event
  # @param [String] routing_key
  # @param [Bunny::Session] bunny
  def run(event, routing_key, bunny = BUNNY_CON)
    return unless bunny

    add_extra_properties(event)
    publish_to_rabbitmq(bunny, event, routing_key)
  end

  # Dummy method to allow some extensibility.
  # Prepend it with your own implementation to add extra properties (in place)
  # to the event.
  #
  # @param [Hash] event
  # @return [nil] Modifies the event in place
  def add_extra_properties(event); end

  private

  # @param [Bunny::Session] bunny RabbitMQ client
  # @param [#to_json] event
  # @param [String] routing_key
  def publish_to_rabbitmq(bunny, event, routing_key)
    bunny.create_channel.tap do |channel|
      exchange = channel.topic('cl2back')
      exchange.publish(
        event.to_json,
        app_id: 'cl2-back',
        content_type: 'application/json',
        routing_key: routing_key
      )
    end.close
  end
end
