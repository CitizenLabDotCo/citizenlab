# frozen_string_literal: true

class RemoveUserFromIntercomJob < ApplicationJob
  queue_as :default

  # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
  #   users, see +SideFxUserService#after_destroy_all+).
  def run(user_ids)
    return unless INTERCOM_CLIENT

    TrackIntercomService.new(INTERCOM_CLIENT).forget_users(Array(user_ids))
  end
end
