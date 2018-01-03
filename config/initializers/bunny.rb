require "bunny"

connection = nil

begin
  retries ||= 0
  connection = Bunny.new(ENV.fetch("RABBITMQ_URI"))
  connection.start
rescue Bunny::TCPConnectionFailedForAllHosts => e
  sleep 5
  if (retries += 1) < 10
    retry
  else
    raise e
  end
end

BUNNY_CON = connection
