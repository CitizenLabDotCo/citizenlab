# frozen_string_literal: true

return if Rails.const_defined? 'Console'

require 'citizen_lab/bunny'
require 'nlp/text_network_analysis_service'
require 'nlp/text_network_analysis_result'
require 'json'

return unless (rabbitmq_uri = ENV['RABBITMQ_URI'])

BUNNY_CON ||= CitizenLab::Bunny.connect(rabbitmq_uri)
QUEUE_NAME = 'cl2_back.insights.text_network_analysis'
ROUTING_KEY = 'text_network_analysis.results'

channel = BUNNY_CON.create_channel
exchange = channel.topic('cl2nlp', durable: true)

queue = channel.queue(QUEUE_NAME, durable: true)
               .bind(exchange, routing_key: ROUTING_KEY)

queue.subscribe do |_delivery_info, _properties, payload|

  payload = JSON.parse(payload)

  puts({
    time: Time.now.iso8601,
    message: 'received rabbitmq message',
    queue: QUEUE_NAME,
    routing_key: ROUTING_KEY,
    payload: payload
  }.to_json)

  tna_result = NLP::TextNetworkAnalysisResult.from_json(payload)
  NLP::TextNetworkAnalysisService.handle_result(tna_result)
end
