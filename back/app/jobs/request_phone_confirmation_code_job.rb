# frozen_string_literal: true

class RequestPhoneConfirmationCodeJob < ApplicationJob
  self.priority = 0 # Highest priority: users are waiting on the code to arrive.

  # The entry point for all callers: the code is issued (and committed) right
  # here, synchronously, and only the delivery - the slow part, which talks to
  # the SMS provider - is queued. The code has to exist by the time the request
  # returns: the frontend can submit it immediately (e2e tests do), and there is
  # no guarantee about when a worker picks the job up.
  def self.issue_code_and_deliver_later(user)
    issue_code!(user)
    perform_later(user)
  end

  # Issues (and commits) a fresh code before it is delivered - see
  # RequestEmailConfirmationCodeJob for why delivery stays out of the transaction.
  def self.issue_code!(user)
    confirmation = user.find_or_create_confirmation(:phone_confirmation)

    ActiveRecord::Base.transaction do
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    confirmation
  end

  def run(user)
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i, payload: { new_phone: nil })

    confirmation = user.phone_confirmation
    return if confirmation.nil?

    campaign = EmailCampaigns::Campaigns::PhoneConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(campaign, user, { code: confirmation.code })

    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: confirmation.expiration_at
    ).perform_later(
      user.id,
      PhoneConfirmation.name,
      confirmation.code
    )
    LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i, payload: { new_phone: nil })
  end
end
