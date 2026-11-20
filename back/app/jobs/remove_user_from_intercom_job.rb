# frozen_string_literal: true

class RemoveUserFromIntercomJob < ApplicationJob
  queue_as :default

  # @param [String,Array<String>] user_ids one id, or a list of ids (one job for a batch of
  #   users, see +SideFxUserService#after_destroy_all+).
  def run(user_ids)
    return unless INTERCOM_CLIENT

    service = TrackIntercomService.new(INTERCOM_CLIENT)
    Array(user_ids).each { |user_id| service.forget_user(user_id) }
  end
end
