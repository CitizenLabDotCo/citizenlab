# frozen_string_literal: true

class RequestNewPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, new_phone_number:)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_phone_number: new_phone_number })

    ActiveRecord::Base.transaction do
      user.update!(new_phone_number: new_phone_number)
      confirmation = user.new_phone_confirmation || user.create_new_phone_confirmation!
      confirmation.reset_code!
      campaign = EmailCampaigns::Campaigns::PhoneConfirmation.first_or_create!
      EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })

      confirmation.update!(code_sent_at: Time.zone.now)
      ExpireConfirmationCodeOrDeleteJob.set(
        wait_until: confirmation.expiration_at
      ).perform_later(
        user.id,
        NewPhoneConfirmation.name,
        confirmation.code
      )
      LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_phone_number: new_phone_number })
    end
  end
end
