require "bunny"
require 'json'


if (ENV.fetch("RABBITMQ_URI", false))
  begin
    retries ||= 0
    connection = Bunny.new(ENV.fetch("RABBITMQ_URI"), automatically_recover: true, continuation_timeout: 20000)
    connection.start

    channel = connection.create_channel
    exchange = channel.topic('cl2nlp', :durable => true)
    queue = channel.queue('zeroshot.inference', :durable => true)

    queue.bind(exchange)

    puts ' [*] Waiting for automatic taggings'

    queue.subscribe() do |_delivery_info, _properties, payload|
      puts "Received #{payload}"
      Tagging::AutomaticTaggingService.new.save_tags_from_prediction(JSON.parse(payload))
    end

    rescue Bunny::TCPConnectionFailedForAllHosts => e
      sleep 5
      if (retries += 1) < 10
        retry
      else
        raise e
      end
    end
end
