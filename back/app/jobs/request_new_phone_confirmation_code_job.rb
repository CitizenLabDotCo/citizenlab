# frozen_string_literal: true

# Sends an SMS confirmation code to a user's pending (new) phone number.
# Mirrors RequestNewEmailConfirmationCodeJob, but over the SMS channel: the
# code is delivered through the transactional Campaigns::PhoneConfirmation
# campaign (for the localized body + delivery tracking) via EmailCampaigns::Sms::SendService.
class RequestNewPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, new_phone_number:)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_phone_number: new_phone_number })

    ActiveRecord::Base.transaction do
      user.update!(new_phone_number: new_phone_number)
      confirmation = user.new_phone_confirmation || user.create_new_phone_confirmation!
      confirmation.reset_code!

      campaign = EmailCampaigns::Campaigns::PhoneConfirmation.first_or_create!
      command = campaign.generate_commands(recipient: user, code: confirmation.code).first
      body = MultilocService.new.t(command[:body_multiloc], user.locale)
      delivery = EmailCampaigns::Sms::SendService.new.create_delivery(
        to: user.new_phone_number,
        body: body,
        user_id: user.id,
        campaign_id: campaign.id
      )
      EmailCampaigns::Sms::SendJob.perform_later(delivery.id)

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
