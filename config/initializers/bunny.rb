require "bunny"

BUNNY_CON = Bunny.new(ENV.fetch("RABBITMQ_URI"))
BUNNY_CON.start
