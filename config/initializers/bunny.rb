require "bunny"

connection = nil

if (ENV.fetch("RABBITMQ_URI", false))
  begin
    retries ||= 0
    connection = Bunny.new(ENV.fetch("RABBITMQ_URI"), automatically_recover: true, continuation_timeout: 20000)
    connection.start
  rescue Bunny::TCPConnectionFailedForAllHosts => e
    sleep 5
    if (retries += 1) < 10
      retry
    else
      raise e
    end
  end

end

BUNNY_CON = connection
