# frozen_string_literal: true

# Also deletes users associated with expired && pending invites (accepted_at: nil)!
class DeleteInvitesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [expiry_time,ActiveSupport::TimeWithZone] the expiry time limit for invites
  def run(expiry_time = Invite::EXPIRY_DAYS.days.ago)
    invites_to_destroy = Invite.where(created_at: Invite::NO_EXPIRY_BEFORE_CREATED_AT..expiry_time)
    destroyed_invites_ids = []

    invites_to_destroy.find_each(batch_size: 50) do |invite|
      ErrorReporter.handle do
        invite.destroy!
        destroyed_invites_ids << invite.id
      end
    end

    unless destroyed_invites_ids.empty?
      LogActivityJob.perform_later(
        "Invite/#{destroyed_invites_ids[0]}",
        'bulk_destroy',
        nil, # No user initiated this activity
        Time.now.to_i,
        payload: { destroyed_invites_ids: destroyed_invites_ids }
      )
    end
  end
end
