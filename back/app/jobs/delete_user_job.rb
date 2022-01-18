# frozen_string_literal: true

class DeleteUserJob < ApplicationJob
  self.priority = 90 # pretty low priority (lowest is 100)

  # @param [User,String] user user or user identifier
  # @param [User,NilClass] current_user
  def run(user, current_user = nil)
    user = User.find(user) unless user.respond_to?(:id)
    user.destroy!
    SideFxUserService.new.after_destroy(user, current_user)
  end
end
