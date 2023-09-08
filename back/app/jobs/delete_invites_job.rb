# frozen_string_literal: true

# Also deletes users associated with expired && pending invites (accepted_at: nil)!
class DeleteInvitesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [expiry_time,ActiveSupport::TimeWithZone] the expiry time limit for invites
  def run(expiry_time = Invite::EXPIRY_DAYS.days.ago)
    invites_to_destroy = Invite.where('created_at < ?', expiry_time)
    representative_invite = invites_to_destroy.first
    destroyed_invites_count = 0

    invites_to_destroy.find_each(batch_size: 50) do |invite|
      ErrorReporter.handle do
        invite.destroy!
        destroyed_invites_count += 1
      end
    end

    if destroyed_invites_count.positive?
      LogActivityJob.perform_later(
        "Invite/#{representative_invite.id}",
        'bulk_destroy',
        nil, # No user initiated this activity
        Time.now.to_i,
        payload: { destroyed_invites_count: destroyed_invites_count }
      )
    end
  end
end
