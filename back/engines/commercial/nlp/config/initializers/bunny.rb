# frozen_string_literal: true

require 'citizen_lab/bunny'
require 'json'

return unless (rabbitmq_uri = ENV['RABBITMQ_URI'])

BUNNY_CON ||= CitizenLab::Bunny.connect(rabbitmq_uri)

channel = BUNNY_CON.create_channel
exchange = channel.topic('cl2nlp', durable: true)
queue = channel.queue('cl2_back.zeroshot_results', durable: true)
               .bind(exchange, routing_key: 'zeroshot.inference')

puts '[*] Waiting for automatic taggings'

queue.subscribe do |_delivery_info, _properties, payload|
  puts "Received #{payload}"
  Tagging::AutomaticTaggingService.new.save_tags_from_prediction(JSON.parse(payload))
end
