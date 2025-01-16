# frozen_string_literal: true

require 'citizen_lab/bunny'

rabbitmq_uri = ENV.fetch('RABBITMQ_URI', nil)
BUNNY_CON ||= CitizenLab::Bunny.connect(rabbitmq_uri) if rabbitmq_uri
