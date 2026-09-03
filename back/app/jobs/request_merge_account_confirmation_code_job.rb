# frozen_string_literal: true

# Issues a code proving control of +target_email+, the address of the account the
# (email-less, SSO) user is asking to be merged into.
#
# Unlike RequestNewEmailConfirmationCodeJob this never writes user.new_email: the
# address belongs to somebody else, and User#validate_not_duplicate_new_email would
# reject it. The address lives on the confirmation instead.
class RequestMergeAccountConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, target_email:)
    # Deliberately no target_email in the payload: activities are readable by
    # admins, and this one would record an address the user merely typed.
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i)

    confirmation = user.find_or_create_confirmation(:merge_account_confirmation, target_email: target_email)

    # Issue (and commit) the code before delivering it - see
    # RequestEmailConfirmationCodeJob for why delivery stays out of the transaction.
    ActiveRecord::Base.transaction do
      confirmation.update!(target_email: target_email)
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    campaign = EmailCampaigns::Campaigns::MergeAccountConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(
      campaign, user, { code: confirmation.code, email: target_email }
    )

    ExpireConfirmationCodeOrDeleteJob.set(
      wait_until: confirmation.expiration_at
    ).perform_later(
      user.id,
      MergeAccountConfirmation.name,
      confirmation.code
    )
    LogActivityJob.perform_later(user, 'received_confirmation_code', user, Time.now.to_i)
  end
end
