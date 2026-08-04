# frozen_string_literal: true

class RequestNewEmailConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, new_email:)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })

    confirmation = user.new_email_confirmation

    # Issue (and commit) the code before delivering it - see
    # RequestEmailConfirmationCodeJob for why delivery stays out of the transaction.
    ActiveRecord::Base.transaction do
      user.update!(new_email: new_email)
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    campaign = EmailCampaigns::Campaigns::NewEmailConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })

    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: confirmation.expiration_at
    ).perform_later(
      user.id,
      NewEmailConfirmation.name,
      confirmation.code
    )
    LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_email: new_email })
  end
end
