# frozen_string_literal: true

class RequestNewPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 0 # Highest priority: users are waiting on the code to arrive.

  def run(user, new_phone:)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_phone: new_phone })

    confirmation = user.find_or_create_confirmation(:new_phone_confirmation)

    # Issue (and commit) the code before delivering it - see
    # RequestEmailConfirmationCodeJob for why delivery stays out of the transaction.
    ActiveRecord::Base.transaction do
      user.update!(new_phone: new_phone)
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    campaign = EmailCampaigns::Campaigns::NewPhoneConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })

    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: confirmation.expiration_at
    ).perform_later(
      user.id,
      NewPhoneConfirmation.name,
      confirmation.code
    )
    LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_phone: new_phone })
  end
end
