# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendJob < ApplicationJob
      def run(to:, body:, user_id: nil, campaign_id: nil)
        Sender.new.send_now(to: to, body: body, user_id: user_id, campaign_id: campaign_id)
      end
    end
  end
end
