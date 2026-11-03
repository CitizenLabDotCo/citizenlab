# frozen_string_literal: true

# Issues a code proving control of +merge_target_email+: the address of the account the
# user wants to be merged into.
class RequestMergeAccountConfirmationCodeJob < ApplicationJob
  self.priority = 30 # More important than default (50)

  def run(user, merge_target_email:)
    # No address in the payload: activities are admin-readable, and this would record an
    # address the user merely typed.
    LogActivityJob.perform_later(user, 'requested_confirmation_code', user, Time.now.to_i)

    confirmation = user.find_or_create_confirmation(:merge_account_confirmation)

    # Issue (and commit) the code before delivering it - see
    # RequestEmailConfirmationCodeJob for why delivery stays out of the transaction.
    ActiveRecord::Base.transaction do
      # A user holds one pending address at a time, so this replaces any new_email.
      user.update!(merge_target_email: merge_target_email, new_email: nil)
      confirmation.reset_code!
      confirmation.update!(code_sent_at: Time.zone.now)
    end

    campaign = EmailCampaigns::Campaigns::MergeAccountConfirmation.first_or_create!
    EmailCampaigns::DeliveryService.new.send_now_to_user(
      campaign, user, { code: confirmation.code, email: merge_target_email }
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
