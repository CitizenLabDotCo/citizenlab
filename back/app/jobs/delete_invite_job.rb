# frozen_string_literal: true

# WARNING! Also deletes associated users with invite_status: 'pending'!
class DeleteInviteJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [Invite,String] invite invite or invite identifier
  # @param [User,NilClass] current_user
  def run(invite)
    invite = Invite.find(invite) unless invite.respond_to?(:id)
    invite.destroy!
  end
end
