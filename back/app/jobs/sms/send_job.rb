# frozen_string_literal: true

module Sms
  class SendJob < ApplicationJob
    def run(to:, body:, user_id: nil, provider: Sms::Sender::DEFAULT_PROVIDER)
      Sms::Sender.new.send(to: to, body: body, user_id: user_id, provider: provider)
    end
  end
end
