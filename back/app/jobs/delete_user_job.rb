# frozen_string_literal: true

class DeleteUserJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [User,String] user user or user identifier
  # @param [User,NilClass] current_user
  # @param [Boolean] delete_participation_data When true, permanently deletes all user
  #   content instead of anonymizing it
  def run(user, current_user = nil, delete_participation_data: false)
    user = User.find(user) unless user.respond_to?(:id)

    ActiveRecord::Base.transaction do
      ParticipantsService.new.destroy_user_participation_data(user) if delete_participation_data
      user.destroy!
    end

    SideFxUserService.new.after_destroy(
      user, current_user,
      participation_data_deleted: delete_participation_data
    )
  end
end
