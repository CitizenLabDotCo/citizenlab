# frozen_string_literal: true

# Also deletes users associated with expired && pending invites (accepted_at: nil)!
class DeleteInvitesJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [expiry_time,ActiveSupport::TimeWithZone] the expiry time limit for invites
  def run(expiry_time = Invite::EXPIRY_DAYS.days.ago)
    invites_to_destroy = Invite.where('created_at < ?', expiry_time)
    payload = { destroyed_invites: [] }

    invites_to_destroy.find_each(batch_size: 50) do |invite|
      invite.destroy!
      payload[:destroyed_invites] << invite.as_json
    rescue StandardError => e
      ErrorReporter.report e
    end

    unless payload[:destroyed_invites].empty?
      LogActivityJob.perform_later(
        'Invite/11111111-1111-1111-1111-111111111111', # Hacky way to provide an id (required), whilst also highlighting that this does not relate to one specific invite
        'bulk_destroy',
        nil, # No user initiated this activity
        Time.now.to_i,
        payload: payload
      )
    end
  end
end
