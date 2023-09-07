# frozen_string_literal: true

# Also deletes users associated with expired && pending invites (accepted_at: nil)!
class DeleteInvitesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [expiry_time,ActiveSupport::TimeWithZone] the expiry time limit for invites
  def run(expiry_time = Invite::EXPIRY_DAYS.days.ago)
    invites_to_destroy = Invite.where('created_at < ?', expiry_time)

    invites_to_destroy.each do |invite|
      invite.destroy!
    rescue StandardError => e
      ErrorReporter.report e
    end
  end
end
