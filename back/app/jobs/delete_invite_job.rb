# frozen_string_literal: true

# WARNING! Also deletes users associated with pending invite (accepted_at: nil)!
class DeleteInviteJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [Invite,String] invite invite or invite identifier
  def run(invite)
    invite = Invite.find(invite) unless invite.respond_to?(:id)
    invite.destroy!
  end
end
