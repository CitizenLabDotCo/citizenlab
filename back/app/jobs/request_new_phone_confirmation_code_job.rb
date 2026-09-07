# frozen_string_literal: true

class RequestNewPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 0 # Highest priority: users are waiting on the code to arrive.

  # The entry point for all callers - see RequestPhoneConfirmationCodeJob for why
  # the code is issued synchronously and only the delivery is queued.
  def self.issue_code_and_deliver_later(user, new_phone:)
    issue_code!(user, new_phone: new_phone)
    perform_later(user, new_phone: new_phone)
  end

  # Stores the pending number and issues (and commits) a fresh code before it is
  # delivered - see RequestEmailConfirmationCodeJob for why delivery stays out of
  # the transaction.
  def self.issue_code!(user, new_phone:)
    confirmation = user.find_or_create_confirmation(:new_phone_confirmation)

    ActiveRecord::Base.transaction do
      user.update!(new_phone: new_phone)
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    confirmation
  end

  def run(user, new_phone:)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_phone: new_phone })

    confirmation = user.new_phone_confirmation
    return if confirmation.nil?

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
