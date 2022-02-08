# frozen_string_literal: true

require 'citizen_lab/bunny'
require 'nlp/zeroshot_classification_result'
require 'json'

return unless (rabbitmq_uri = ENV['RABBITMQ_URI'])

BUNNY_CON ||= CitizenLab::Bunny.connect(rabbitmq_uri)

channel = BUNNY_CON.create_channel
exchange = channel.topic('cl2nlp', durable: true)
queue = channel.queue('cl2_back.insights.zeroshot', durable: true)
               .bind(exchange, routing_key: 'zeroshot.inference')

queue.subscribe do |_delivery_info, _properties, payload|
  payload = JSON.parse(payload)

  # [TODO] we need a consistent approach to structured logging
  puts({
    time: Time.now.iso8601,
    message: 'received rabbitmq message',
    queue: 'cl2_back.insights.zeroshot',
    routing_key: 'zeroshot.inference',
    payload: payload
  }.to_json)

  zsc_result = NLP::ZeroshotClassificationResult.from_json(payload)
  Insights::CategorySuggestionsService.save_suggestion(zsc_result)
end
