# frozen_string_literal: true

class RequestEmailConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_email: nil })

    confirmation = user.email_confirmation

    # Issue (and commit) the code before delivering it. Delivery renders and sends
    # an email, which can take a while; holding the row lock across it would make
    # a concurrent confirm attempt read the pre-reset code (and count a retry
    # against the user) for a code that is on its way to them.
    ActiveRecord::Base.transaction do
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    campaign = EmailCampaigns::Campaigns::EmailConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })

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
