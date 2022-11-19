# frozen_string_literal: true

INTERCOM_CLIENT = if ENV['INTERCOM_TOKEN']
  Intercom::Client.new(token: ENV['INTERCOM_TOKEN'])
end
