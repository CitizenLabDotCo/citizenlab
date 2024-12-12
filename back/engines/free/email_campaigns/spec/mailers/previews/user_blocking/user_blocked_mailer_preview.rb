# frozen_string_literal: true

module UserBlocking
  class UserBlockedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def send_user_blocked_email
      recipient_user.update(block_start_at: 5.days.ago, block_end_at: 5.days.from_now, block_reason: 'You breached guideline X')
      ::UserBlockedMailer.with(user: recipient_user).send_user_blocked_email
    end
  end
end
