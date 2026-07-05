# frozen_string_literal: true

module EmailCampaigns
  # Texter for admin-authored manual SMS campaigns. The body is the campaign's
  # stored body_multiloc (carried on the command by SmsManual#generate_commands),
  # rendered in the recipient's locale; it goes to the recipient's confirmed
  # phone number.
  class ManualCampaignTexter < ApplicationTexter
    def body
      MultilocService.new.t(command[:body_multiloc], recipient.locale)
    end

    def destination
      recipient.phone_number
    end
  end
end
