# frozen_string_literal: true

require 'citizen_lab/bunny'

# `.presence` treats a blank RABBITMQ_URI (lite dev stack) as absent, rather
# than connecting to an invalid empty URI and crashing boot.
rabbitmq_uri = ENV['RABBITMQ_URI'].presence
BUNNY_CON ||= CitizenLab::Bunny.connect(rabbitmq_uri) if rabbitmq_uri
