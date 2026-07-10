# frozen_string_literal: true

class DeleteUserJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # A user passed to +perform_later+ is serialized as a global id, which ActiveJob resolves
  # back into a record before +run+ is entered. If the user was deleted while the job sat in
  # the queue, that lookup raises and the no-op guard in +run+ is never reached. Both forms
  # of the +user+ argument should behave the same way: the user is gone, which is what this
  # job is for, so there is nothing left to do.
  #
  # Only a missing +user+ is a no-op. A missing +current_user+ still raises, so that we never
  # silently skip a deletion that was actually requested.
  rescue_from(ActiveJob::DeserializationError) do |exception|
    cause = exception.cause
    missing_id = cause.id if cause.is_a?(ActiveRecord::RecordNotFound)
    raise unless missing_id && missing_id == serialized_user_id

    Rails.logger.warn("DeleteUserJob: user #{missing_id} no longer exists, skipping.")
  end

  # @param [User,String] user user or user identifier. When no such user exists (anymore),
  #   the job is a no-op.
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
    unless user.respond_to?(:id)
      user_id = user
      user = User.find_by(id: user_id)

      # The user can be deleted between the moment the job is enqueued and the moment it
      # runs, e.g. by an overlapping `User.destroy_all_async` sweep. The user is gone,
      # which is what this job is for, so there is nothing left to do. Raising instead
      # would only retry the job until it expires, days later.
      if user.nil?
        Rails.logger.warn("DeleteUserJob: user #{user_id} no longer exists, skipping.")
        return
      end
    end

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

  private

  # @return [String,NilClass] the id of the +user+ argument when it was serialized as a
  #   global id, nil when a plain identifier was given.
  def serialized_user_id
    argument = @serialized_arguments&.first
    return unless argument.is_a?(Hash)

    GlobalID.parse(argument['_aj_globalid'])&.model_id
  end
end
