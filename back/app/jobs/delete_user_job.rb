# frozen_string_literal: true

class DeleteUserJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [User,String] user user or user identifier
  # @param [User,NilClass] current_user
  # @param [Boolean] delete_participation_data When true, permanently deletes all user
  #   content instead of anonymizing it
  # @param [Boolean] ban_email When true, bans the user's email from future registration
  # @param [String,NilClass] ban_reason Optional reason for the email ban
  def run(
    user,
    current_user = nil,
    delete_participation_data: false,
    ban_email: false,
    ban_reason: nil,
    update_member_counts: true
  )
    user = User.find(user) unless user.respond_to?(:id)
    email_to_ban = user.email if ban_email

    ActiveRecord::Base.transaction do
      ParticipantsService.new.destroy_user_participation_data(user) if delete_participation_data
      user.destroy!
      EmailBan.ban!(email_to_ban, reason: ban_reason, banned_by: current_user) if email_to_ban.present?
    end

    SideFxUserService.new.after_destroy(
      user, current_user,
      participation_data_deleted: delete_participation_data,
      update_member_counts:
    )
  end
end
