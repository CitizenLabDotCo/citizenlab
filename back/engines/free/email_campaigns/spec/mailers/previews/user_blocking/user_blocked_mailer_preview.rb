# frozen_string_literal: true

class UserBlockedMailerPreview < ActionMailer::Preview
  def send_user_blocked_email
    user = User.first
    user.update(block_start_at: 5.days.ago, block_reason: 'You breached guideline X')
    ::UserBlockedMailer.with(user: user).send_user_blocked_email
  end
end
