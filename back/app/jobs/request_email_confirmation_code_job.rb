# frozen_string_literal: true

class RequestEmailConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_email: nil })

    ActiveRecord::Base.transaction do
      confirmation = user.email_confirmation
      confirmation.reset_code!
      campaign = EmailCampaigns::Campaigns::EmailConfirmation.first_or_create!
      EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })
      confirmation.update!(code_sent_at: Time.zone.now)
      ExpireConfirmationCodeOrDeleteJob.set(
        wait_until: confirmation.expiration_at
      ).perform_later(
        user.id,
        EmailConfirmation.name,
        confirmation.code
      )
      LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_email: nil })
    end
  end
end
